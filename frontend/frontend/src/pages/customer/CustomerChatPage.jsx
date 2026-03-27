import { useEffect, useRef, useState } from "react";
import {
  getCustomerChatMessages,
  sendCustomerChatAttachment,
  sendCustomerChatMessage,
  downloadCustomerChatAttachment,
} from "../../api/customerChatApi";
import { getCustomerLead, updateCustomerLeadStatus, recordCustomerPayment } from "../../api/customerApi";

const CUSTOMER_REJECT_REASONS = [
  "Budget Too High",
  "Not Interested",
  "Already Purchased",
  "Chose Competitor",
  "Decision Postponed",
  "Need More Time",
];

const PAYMENT_THREAD_MARKER = "[[payment-thread]]";
const DESIGN_THREAD_MARKER = "[[design-thread]]";

function hasPaymentThreadMarker(value) {
  return String(value || "").trimStart().startsWith(PAYMENT_THREAD_MARKER);
}

function hasDesignThreadMarker(value) {
  return String(value || "").trimStart().startsWith(DESIGN_THREAD_MARKER);
}

function stripPaymentThreadMarker(value) {
  const raw = String(value || "");
  if (!hasPaymentThreadMarker(raw)) return raw;
  const startTrimmed = raw.trimStart();
  const withoutMarker = startTrimmed.slice(PAYMENT_THREAD_MARKER.length);
  return withoutMarker.replace(/^\s+/, "");
}

function stripDesignThreadMarker(value) {
  const raw = String(value || "");
  if (!hasDesignThreadMarker(raw)) return raw;
  const startTrimmed = raw.trimStart();
  const withoutMarker = startTrimmed.slice(DESIGN_THREAD_MARKER.length);
  return withoutMarker.replace(/^\s+/, "");
}

function applyCustomerThreadFilter(rows, tab) {
  const list = Array.isArray(rows) ? rows : [];
  return list
    .map((item) => {
      const isPayment = hasPaymentThreadMarker(item?.message);
      const isDesign = hasDesignThreadMarker(item?.message);
      let text = stripPaymentThreadMarker(item?.message || "");
      if (!isPayment) {
        text = stripDesignThreadMarker(item?.message || "");
      }
      return {
        ...item,
        _paymentThreadMessage: isPayment,
        _designThreadMessage: isDesign,
        message: text,
      };
    })
    .filter((item) => {
      if (tab === "PAYMENT") return item._paymentThreadMessage;
      if (tab === "DESIGN") return item._designThreadMessage;
      return !item._paymentThreadMessage && !item._designThreadMessage;
    });
}

function formatDateTime(value) {
  if (!value) return "-";
  try {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleString();
  } catch {
    return String(value);
  }
}

function buildReplyPrefix(reply) {
  if (!reply) return "";
  const isFile = !!reply.attachmentName;
  const snippet = (reply.message || "").replace(/\s+/g, " ").trim().slice(0, 120);
  const meta = isFile
    ? `type=file|name=${reply.attachmentName}`
    : `type=text|text=${encodeURIComponent(snippet)}`;
  return `[[reply]]${meta}[[/reply]]\n`;
}

function parseReplyMessage(value) {
  const raw = value || "";
  if (!raw.startsWith("[[reply]]")) {
    return { reply: null, text: raw };
  }
  const end = raw.indexOf("[[/reply]]");
  if (end === -1) {
    return { reply: null, text: raw };
  }
  const meta = raw.slice(9, end);
  const text = raw.slice(end + 10).trimStart();
  const parts = {};
  meta.split("|").forEach((entry) => {
    const [key, ...rest] = entry.split("=");
    if (!key) return;
    parts[key] = rest.join("=");
  });
  const reply =
    parts.type === "file"
      ? { type: "file", name: parts.name || "File" }
      : { type: "text", text: decodeURIComponent(parts.text || "") };
  return { reply, text };
}

function parseChoiceMessage(value) {
  const raw = value || "";
  const start = raw.indexOf("[[choice]]");
  const end = raw.indexOf("[[/choice]]");
  if (start === -1 || end === -1 || end < start) {
    return { choices: null, text: raw };
  }
  const choiceText = raw.slice(start + 10, end).trim();
  const choices = choiceText
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  const text = (raw.slice(0, start) + raw.slice(end + 11)).trim();
  return { choices, text };
}

function buildResolvedChoiceIds(messages) {
  const rows = Array.isArray(messages) ? messages : [];
  const resolved = new Set();
  for (let index = 0; index < rows.length; index += 1) {
    const current = rows[index];
    const parsedChoice = parseChoiceMessage(parseReplyMessage(current?.message || "").text);
    if (!parsedChoice.choices?.length) {
      continue;
    }
    for (let nextIndex = index + 1; nextIndex < rows.length; nextIndex += 1) {
      const next = rows[nextIndex];
      const nextMessage = String(next?.message || "").trim().toLowerCase();
      const isTerminalSelection =
        next?.senderRole === "CUSTOMER" &&
        (nextMessage.startsWith("customer selected: accept") ||
          nextMessage.startsWith("customer selected: reject"));
      if (isTerminalSelection) {
        if (current?.id != null) {
          resolved.add(current.id);
        }
        break;
      }
    }
  }
  return resolved;
}

export default function CustomerChatPage() {
  const [allMessages, setAllMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);
  const [leadName, setLeadName] = useState("Support");
  const [leadId, setLeadId] = useState(null);
  const [leadStatus, setLeadStatus] = useState("");
  const [chatTab, setChatTab] = useState("SUPPORT"); // SUPPORT = normal staff thread
  const [replyTo, setReplyTo] = useState(null);
  const [menu, setMenu] = useState({ visible: false, x: 0, y: 0, message: null });
  const [notice, setNotice] = useState("");
  const [respondedChoices, setRespondedChoices] = useState(() => new Set());
  const [rejectPrompt, setRejectPrompt] = useState({ open: false, messageId: null, choice: "" });
  const [partialPrompt, setPartialPrompt] = useState({ open: false, messageId: null });
  const [partialAmount, setPartialAmount] = useState("");
  const [rejectedReason, setRejectedReason] = useState("");
  const [rejectedReasonDetail, setRejectedReasonDetail] = useState("");
  // design-specific prompts
  const [showAcceptPrompt, setShowAcceptPrompt] = useState(false);
  const [acceptMessageId, setAcceptMessageId] = useState(null);
  const [acceptFile, setAcceptFile] = useState(null);
  const [acceptFileName, setAcceptFileName] = useState("");
  const [showChangePrompt, setShowChangePrompt] = useState(false);
  const [changeMessageId, setChangeMessageId] = useState(null);
  const [changeNote, setChangeNote] = useState("");
  const lastSeenRef = useRef(null);
  const didInitRef = useRef(false);

  const messages = applyCustomerThreadFilter(allMessages, chatTab);

  const isPaymentStatus = String(leadStatus || "").trim().toLowerCase() === "payment";
  const isDesignStatus = String(leadStatus || "").trim().toLowerCase() === "design";
  const hasPaymentThread = allMessages.some((item) => hasPaymentThreadMarker(item?.message));
  const hasDesignThread = allMessages.some((item) => hasDesignThreadMarker(item?.message));
  const showPaymentTab = isPaymentStatus || hasPaymentThread;
  const showDesignTab = isDesignStatus || hasDesignThread || chatTab === "DESIGN";

  useEffect(() => {
    let active = true;
    const loadLead = async () => {
      try {
        const lead = await getCustomerLead();
        if (!active) return;
        setLeadName(lead?.name || lead?.projectName || "Support");
        setLeadId(lead?.id);
        setLeadStatus(lead?.status || "");
      } catch {
        if (active) {
          setLeadName("Support");
          setLeadStatus("");
        }
      }
    };
    loadLead();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    const loadMessages = async () => {
      setLoading(true);
      try {
        const rows = await getCustomerChatMessages();
        if (!active) return;
        const list = Array.isArray(rows) ? rows : [];
        setAllMessages(list);
        const latest = list[list.length - 1];
        const latestId = latest?.id || latest?.createdAt || null;
        if (latestId && didInitRef.current) {
          const isIncoming = latest?.senderRole && latest.senderRole !== "CUSTOMER";
          if (isIncoming && latestId !== lastSeenRef.current) {
            setNotice("New message received");
            setTimeout(() => setNotice(""), 3000);
          }
        }
        if (latestId) {
          lastSeenRef.current = latestId;
        }
        if (!didInitRef.current) {
          didInitRef.current = true;
        }
      } catch (error) {
        if (!active) return;
        if (error?.response?.status === 401) {
          console.error("[CustomerChatPage] Auth failed (401) - session may have expired");
          setNotice("Your session has expired, please log in again.");
        } else {
          console.debug("Failed to load messages:", error?.message);
        }
        if (active) setAllMessages([]);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadMessages();
    const interval = setInterval(loadMessages, 8000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const sendMessage = async () => {
    const trimmed = text.trim();
    if (!trimmed && !file) return;
    const replyPrefix = buildReplyPrefix(replyTo);
    const paymentPrefix = chatTab === "PAYMENT" ? `${PAYMENT_THREAD_MARKER}\n` : "";
    const designPrefix = chatTab === "DESIGN" ? `${DESIGN_THREAD_MARKER}\n` : "";
    const finalMessage = `${paymentPrefix}${designPrefix}${replyPrefix}${trimmed}`.trim();
    if (file) {
      await sendCustomerChatAttachment({ message: finalMessage, file });
    } else {
      await sendCustomerChatMessage(finalMessage);
    }
    setText("");
    setFile(null);
    setReplyTo(null);
    const rows = await getCustomerChatMessages();
    setAllMessages(Array.isArray(rows) ? rows : []);
  };

  const respondToChoice = async (messageId, choice) => {
    if (!choice || respondedChoices.has(messageId)) return;
    const normalized = String(choice).trim().toLowerCase();
    const label = normalized.charAt(0).toUpperCase() + normalized.slice(1);
    if (chatTab === "DESIGN") {
      if (normalized === "accept") {
        setShowAcceptPrompt(true);
        setAcceptMessageId(messageId);
        return;
      }
      if (normalized === "reject") {
        setRejectPrompt({ open: true, messageId, choice: normalized });
        return;
      }
      if (normalized === "change") {
        setShowChangePrompt(true);
        setChangeMessageId(messageId);
        return;
      }
      if (normalized === "continue") {
        try {
          await sendCustomerChatMessage(`${DESIGN_THREAD_MARKER}\nCustomer selected: Continue`);
          setNotice("Your response was recorded.");
          setTimeout(() => setNotice(""), 3000);
        } catch (error) {
          console.error("Error sending customer choice:", error);
          const apiMessage =
            error?.response?.data?.message ||
            error?.response?.data?.error ||
            error?.message ||
            "Unknown error";
          setNotice(`Failed to send selection: ${apiMessage}`);
          setTimeout(() => setNotice(""), 4000);
        }
        return;
      }
    }
    // existing payment/other logic follows
    if (normalized === "reject") {
      setRejectPrompt({ open: true, messageId, choice: normalized });
      return;
    }
    if (normalized === "pay full amount") {
      setRespondedChoices((prev) => new Set(prev).add(messageId));
      try {
        await recordCustomerPayment({ type: "full" });
        const prefix = chatTab === "PAYMENT" ? `${PAYMENT_THREAD_MARKER}\n` : "";
        await sendCustomerChatMessage(`${prefix}Customer selected: Pay Full Amount`);
        setNotice("Payment recorded. Thank you!");
        setTimeout(() => setNotice(""), 3000);
        const rows = await getCustomerChatMessages();
        setAllMessages(Array.isArray(rows) ? rows : []);
      } catch (error) {
        console.error("Error sending payment choice:", error);
        setRespondedChoices((prev) => { const c = new Set(prev); c.delete(messageId); return c; });
      }
      return;
    }
    if (normalized === "pay partial amount") {
      setPartialPrompt({ open: true, messageId });
      return;
    }
    if (normalized === "continue") {
      try {
        await sendCustomerChatMessage(`Customer selected: ${label}`);
        setNotice("Your response was recorded.");
        setTimeout(() => setNotice(""), 3000);
      } catch (error) {
        console.error("Error sending customer choice:", error);
        const apiMessage =
          error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Unknown error";
        setNotice(`Failed to send selection: ${apiMessage}`);
        setTimeout(() => setNotice(""), 4000);
      }
      return;
    }
    setRespondedChoices((prev) => new Set(prev).add(messageId));
    
    try {
      if (normalized === "accept") {
        await updateCustomerLeadStatus("Payment", leadId);
        await sendCustomerChatMessage(`Customer selected: ${label}`);
        setNotice("Your response was recorded. The support flow has moved to payment.");
        setTimeout(() => setNotice(""), 4000);
        return;
      }
      await sendCustomerChatMessage(`Customer selected: ${label}`);
    } catch (error) {
      console.error("Error updating customer lead status:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error";
      setNotice(`Failed to update selection: ${apiMessage}`);
      setTimeout(() => setNotice(""), 4000);
      setRespondedChoices((prev) => {
        const copy = new Set(prev);
        copy.delete(messageId);
        return copy;
      });
    }
  };

  const closePartialPrompt = () => {
    setPartialPrompt({ open: false, messageId: null });
    setPartialAmount("");
  };

  const submitPartialPayment = async () => {
    const messageId = partialPrompt.messageId;
    if (!messageId || respondedChoices.has(messageId)) return;
    if (!partialAmount || Number(partialAmount) <= 0) {
      setNotice("Please enter the amount you want to pay.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }
    setRespondedChoices((prev) => new Set(prev).add(messageId));
    try {
      const formatted = Number(partialAmount).toLocaleString("en-IN");
      await recordCustomerPayment({ amount: Number(partialAmount), type: "partial" });
      const prefix = chatTab === "PAYMENT" ? `${PAYMENT_THREAD_MARKER}\n` : "";
      await sendCustomerChatMessage(`${prefix}Customer selected: Pay Partial Amount (\u20b9${formatted})`);
      setNotice("Your response was recorded.");
      setTimeout(() => setNotice(""), 3000);
      closePartialPrompt();
      const rows = await getCustomerChatMessages();
      const list = applyCustomerThreadFilter(rows, chatTab);
      setAllMessages(list);
    } catch (error) {
      console.error("Error sending partial payment:", error);
      setRespondedChoices((prev) => { const c = new Set(prev); c.delete(messageId); return c; });
    }
  };

  const closeRejectPrompt = () => {
    setRejectPrompt({ open: false, messageId: null, choice: "" });
    setRejectedReason("");
    setRejectedReasonDetail("");
  };

  const closeAcceptPrompt = () => {
    setShowAcceptPrompt(false);
    setAcceptMessageId(null);
    setAcceptFile(null);
    setAcceptFileName("");
  };

  const closeChangePrompt = () => {
    setShowChangePrompt(false);
    setChangeMessageId(null);
    setChangeNote("");
  };

  const submitRejectChoice = async () => {
    const messageId = rejectPrompt.messageId;
    if (!messageId || respondedChoices.has(messageId)) return;
    if (!rejectedReason) {
      setNotice("Please select a rejection reason.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }
    setRespondedChoices((prev) => new Set(prev).add(messageId));
    try {
      // update lead only when not design
      if (chatTab !== "DESIGN") {
        await updateCustomerLeadStatus("Rejected", leadId, {
          rejectedReason,
          rejectedReasonSubtype: rejectedReasonDetail || null,
        });
      }
      const prefix = chatTab === "DESIGN" ? `${DESIGN_THREAD_MARKER}\n` : "";
      await sendCustomerChatMessage(
        `${prefix}Customer selected: Reject${rejectedReason ? ` (${rejectedReason})` : ""}`,
      );
      setNotice("Your response was recorded.");
      setTimeout(() => setNotice(""), 4000);
      closeRejectPrompt();
    } catch (error) {
      console.error("Error updating customer lead status:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        error?.message ||
        "Unknown error";
      setNotice(`Failed to update selection: ${apiMessage}`);
      setTimeout(() => setNotice(""), 4000);
      setRespondedChoices((prev) => {
        const copy = new Set(prev);
        copy.delete(messageId);
        return copy;
      });
    }
  };

  const submitAcceptChoice = async () => {
    if (!acceptMessageId || respondedChoices.has(acceptMessageId)) return;
    if (!acceptFile) {
      setNotice("Please choose a file before submitting.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }
    setRespondedChoices((prev) => new Set(prev).add(acceptMessageId));
    try {
      const prefix = `${DESIGN_THREAD_MARKER}\n`;
      await sendCustomerChatAttachment({ message: `${prefix}Customer selected: Accept`, file: acceptFile });
      setNotice("Your response was recorded.");
      setTimeout(() => setNotice(""), 3000);
      closeAcceptPrompt();
      const rows = await getCustomerChatMessages();
      const list = applyCustomerThreadFilter(rows, chatTab);
      setAllMessages(list);
    } catch (error) {
      console.error("Error sending accept choice:", error);
      setRespondedChoices((prev) => { const c = new Set(prev); c.delete(acceptMessageId); return c; });
    }
  };

  const submitChangeChoice = async () => {
    if (!changeMessageId || respondedChoices.has(changeMessageId)) return;
    if (!changeNote) {
      setNotice("Please describe the changes.");
      setTimeout(() => setNotice(""), 3000);
      return;
    }
    setRespondedChoices((prev) => new Set(prev).add(changeMessageId));
    try {
      const prefix = `${DESIGN_THREAD_MARKER}\n`;
      await sendCustomerChatMessage(`${prefix}Customer requested change: ${changeNote}`);
      setNotice("Your response was recorded.");
      setTimeout(() => setNotice(""), 3000);
      closeChangePrompt();
      const rows = await getCustomerChatMessages();
      const list = applyCustomerThreadFilter(rows, chatTab);
      setAllMessages(list);
    } catch (error) {
      console.error("Error sending change choice:", error);
      setRespondedChoices((prev) => { const c = new Set(prev); c.delete(changeMessageId); return c; });
    }
  };

  const downloadAttachment = async (item) => {
    if (!item?.id) return;
    const blob = await downloadCustomerChatAttachment(item.id);
    if (!blob) return;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = item.attachmentName || "attachment";
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const openMenu = (event, item) => {
    event.preventDefault();
    setMenu({ visible: true, x: event.clientX, y: event.clientY, message: item });
  };

  const closeMenu = () => {
    setMenu({ visible: false, x: 0, y: 0, message: null });
  };

  const handleReply = () => {
    if (menu.message) {
      setReplyTo(menu.message);
    }
    closeMenu();
  };

  const resolvedChoiceIds = buildResolvedChoiceIds(messages);


  return (
    <div className="customer-chat" onClick={closeMenu}>
      {notice ? <div className="chat-notice">{notice}</div> : null}
      <div className="customer-chat__grid">
        <aside className="customer-chat__list">
          <div className="customer-chat__list-header">
            <div>
              <h4>Chats</h4>
              <p className="text-muted">Quick access to support</p>
            </div>
            <button className="btn btn-sm btn-outline-secondary" type="button" disabled>
              <i className="ti ti-search" />
            </button>
          </div>
          <div
            className={`customer-chat__contact${chatTab === "SUPPORT" ? " customer-chat__contact--active" : ""}`}
            style={{ cursor: "pointer" }}
            onClick={() => setChatTab("SUPPORT")}
          >
            <div className="customer-chat__avatar">
              <img src="/assets/img/profiles/avatar-02.jpg" alt="Support" />
              <span className="customer-chat__status-dot" />
            </div>
            <div className="customer-chat__contact-info">
              <h6>SVL Support</h6>
              <span>{leadName ? `Project: ${leadName}` : "Customer Care"}</span>
            </div>
            <div className="customer-chat__contact-state">Online</div>
          </div>
          {showPaymentTab ? (
            <div
              className={`customer-chat__contact${chatTab === "PAYMENT" ? " customer-chat__contact--active" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setChatTab("PAYMENT")}
            >
              <div className="customer-chat__avatar">
                <img src="/assets/img/profiles/avatar-06.jpg" alt="Payment" />
                <span className="customer-chat__status-dot" />
              </div>
              <div className="customer-chat__contact-info">
                <h6>Payment</h6>
                <span>Payment Discussion</span>
              </div>
              <div className="customer-chat__contact-state">Online</div>
            </div>
          ) : null}
          {showDesignTab ? (
            <div
              className={`customer-chat__contact${chatTab === "DESIGN" ? " customer-chat__contact--active" : ""}`}
              style={{ cursor: "pointer" }}
              onClick={() => setChatTab("DESIGN")}
            >
              <div className="customer-chat__avatar">
                <img src="/assets/img/profiles/avatar-10.jpg" alt="Design" />
                <span className="customer-chat__status-dot" />
              </div>
              <div className="customer-chat__contact-info">
                <h6>Design</h6>
                <span>Design Team</span>
              </div>
              <div className="customer-chat__contact-state">Online</div>
            </div>
          ) : null}
        </aside>

        <section className="customer-chat__panel">
          <div className="customer-chat__panel-header">
            <div className="customer-chat__panel-title">
              <div className="customer-chat__avatar customer-chat__avatar--lg">
                <img
                src={
                  chatTab === "PAYMENT"
                    ? "/assets/img/profiles/avatar-06.jpg"
                    : chatTab === "DESIGN"
                    ? "/assets/img/profiles/avatar-10.jpg"
                    : "/assets/img/profiles/avatar-02.jpg"
                }
                alt={
                  chatTab === "PAYMENT"
                    ? "Payment"
                    : chatTab === "DESIGN"
                    ? "Design"
                    : "Support"
                }
              />
                <span className="customer-chat__status-dot" />
              </div>
              <div>
                <h5>
                  {chatTab === "PAYMENT" ? "Payment" : chatTab === "DESIGN" ? "Design" : "SVL Support"}
                </h5>
                <p>
                  {chatTab === "PAYMENT"
                    ? "Payment Discussion"
                    : chatTab === "DESIGN"
                    ? "Design Discussion"
                    : leadName
                    ? `Project: ${leadName}`
                    : "Customer Care"}
                </p>
              </div>
            </div>
            <div className="customer-chat__panel-actions">
              <button className="btn btn-icon btn-light" type="button" disabled>
                <i className="ti ti-dots-vertical" />
              </button>
            </div>
          </div>

          <div className="customer-chat__panel-body">
            {loading ? (
              <div className="customer-chat__empty">Loading chat...</div>
            ) : messages.length === 0 ? (
              <div className="customer-chat__empty">
                No messages yet. Say hello to start the conversation.
              </div>
            ) : (
              <div className="customer-chat__messages">
                {messages.map((item) => {
                  const isMine = item.senderRole === "CUSTOMER";
                  const parsedReply = parseReplyMessage(item.message || "");
                  const parsedChoice = parseChoiceMessage(parsedReply.text);
                  return (
                    <div
                      key={item.id || `${item.message}-${item.createdAt}`}
                      className={`customer-msg ${isMine ? "customer-msg--mine" : "customer-msg--theirs"}`}
                    >
                      <div className="customer-msg__bubble" onContextMenu={(e) => openMenu(e, item)}>
                        {parsedReply.reply ? (
                          <div className="customer-msg__reply">
                            <span>Replying to</span>
                            <p>
                              {parsedReply.reply.type === "file"
                                ? `File: ${parsedReply.reply.name}`
                                : parsedReply.reply.text}
                            </p>
                          </div>
                        ) : null}
                        <div className="customer-msg__text">
                          {parsedChoice.text || parsedReply.text}
                        </div>
                        {!isMine && parsedChoice.choices?.length ? (
                          <div className="d-flex flex-wrap gap-2 mt-2">
                            {parsedChoice.choices.map((choice) => (
                              <button
                                key={`${item.id}-${choice}`}
                                type="button"
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => respondToChoice(item.id, choice)}
                                disabled={
                                  respondedChoices.has(item.id) ||
                                  resolvedChoiceIds.has(item.id)
                                }
                                title=""
                              >
                                {choice}
                              </button>
                            ))}
                          </div>
                        ) : null}
                        {item.attachmentName ? (
                          <button
                            type="button"
                            className="customer-msg__file"
                            onClick={() => downloadAttachment(item)}
                          >
                            <i className="ti ti-paperclip" />
                            <span>{item.attachmentName}</span>
                          </button>
                        ) : null}
                        <div className="customer-msg__time">{formatDateTime(item.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="customer-chat__panel-footer">
            <div className="customer-chat__composer">
              {replyTo ? (
                <div className="customer-chat__reply">
                  <div>
                    <strong>Replying to</strong>
                    <p>{(replyTo.message || "").slice(0, 120)}</p>
                  </div>
                  <button type="button" onClick={() => setReplyTo(null)}>
                    <i className="ti ti-x" />
                  </button>
                </div>
              ) : null}
              <input
                type="text"
                placeholder="Type your message"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <label className="customer-chat__attach">
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <i className="ti ti-paperclip" />
              </label>
              <button className="btn btn-primary" type="button" onClick={sendMessage}>
                <i className="ti ti-send" />
                <span>Send</span>
              </button>
            </div>
          </div>
        </section>
      </div>

      {menu.visible ? (
        <div
          className="chat-context-menu"
          style={{ top: menu.y, left: menu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button type="button" onClick={handleReply}>
            Reply
          </button>
          {menu.message?.attachmentName ? (
            <button type="button" onClick={() => downloadAttachment(menu.message)}>
              Download
            </button>
          ) : null}
        </div>
      ) : null}
      {showAcceptPrompt ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
          onClick={closeAcceptPrompt}
        >
          <div
            className="card shadow-lg"
            style={{ width: "100%", maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Upload Design File</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeAcceptPrompt}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Choose file</label>
                <input
                  className="form-control"
                  type="file"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null;
                    setAcceptFile(f);
                    setAcceptFileName(f?.name || "");
                  }}
                />
                {acceptFileName && <div className="text-muted mt-1">{acceptFileName}</div>}
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitAcceptChoice}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {showChangePrompt ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
          onClick={closeChangePrompt}
        >
          <div
            className="card shadow-lg"
            style={{ width: "100%", maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Describe Changes</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeChangePrompt}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">What needs to change?</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={changeNote}
                  onChange={(e) => setChangeNote(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-end">
                <button className="btn btn-primary" onClick={submitChangeChoice}>
                  Send
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {rejectPrompt.open ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
          onClick={closeRejectPrompt}
        >
          <div
            className="card shadow-lg"
            style={{ width: "100%", maxWidth: "520px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Select Rejection Reason</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closeRejectPrompt}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Rejected Reason</label>
                <select
                  className="form-select"
                  value={rejectedReason}
                  onChange={(e) => setRejectedReason(e.target.value)}
                >
                  <option value="">Select reason</option>
                  {CUSTOMER_REJECT_REASONS.map((reason) => (
                    <option key={reason} value={reason}>
                      {reason}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label">Details</label>
                <textarea
                  className="form-control"
                  rows={3}
                  value={rejectedReasonDetail}
                  onChange={(e) => setRejectedReasonDetail(e.target.value)}
                  placeholder="Optional details"
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={closeRejectPrompt}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger" onClick={submitRejectChoice}>
                  Submit Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
      {partialPrompt.open ? (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50"
          style={{ zIndex: 1050 }}
          onClick={closePartialPrompt}
        >
          <div
            className="card shadow-lg"
            style={{ width: "100%", maxWidth: "420px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="card-header d-flex align-items-center justify-content-between">
              <h5 className="mb-0">Enter Partial Payment Amount</h5>
              <button
                type="button"
                className="btn-close"
                aria-label="Close"
                onClick={closePartialPrompt}
              />
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Amount (₹)</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="Enter amount"
                  value={partialAmount}
                  onChange={(e) => setPartialAmount(e.target.value)}
                  min="0"
                />
              </div>
              <div className="d-flex justify-content-end gap-2">
                <button type="button" className="btn btn-light" onClick={closePartialPrompt}>
                  Cancel
                </button>
                <button type="button" className="btn btn-primary" onClick={submitPartialPayment}>
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
