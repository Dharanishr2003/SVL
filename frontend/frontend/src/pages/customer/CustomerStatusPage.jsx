import { useEffect, useState } from "react";
import { getCustomerLead } from "../../api/customerApi";

export default function CustomerStatusPage() {
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const data = await getCustomerLead();
        if (!active) return;
        setLead(data);
      } catch {
        if (active) setLead(null);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const leadTitle = lead?.name || lead?.projectName || "Your Enquiry";
  const statusText = lead?.status || "Pending";

  return (
    <div className="customer-status">
      <div className="customer-status__header">
        <div>
          <h3>Status Tracker</h3>
          <p>Track the current progress of your enquiry.</p>
        </div>
        <span className="customer-status__badge">{statusText}</span>
      </div>

      <div className="customer-status__grid">
        <div className="customer-status__card">
          <h5>Lead Summary</h5>
          {loading ? (
            <div className="text-muted">Loading...</div>
          ) : lead ? (
            <div className="customer-status__summary">
              <div>
                <span>Lead</span>
                <strong>{leadTitle}</strong>
              </div>
              <div>
                <span>Current Status</span>
                <strong>{statusText}</strong>
              </div>
              <div>
                <span>Assigned Team</span>
                <strong>{lead?.leadGroupName || lead?.groupName || "Support"}</strong>
              </div>
            </div>
          ) : (
            <div className="text-muted">No lead found.</div>
          )}
        </div>

        <div className="customer-status__card">
          <h5>What Happens Next</h5>
          <ul className="customer-status__steps">
            <li>
              <span>Review</span>
              <p>Our team is reviewing your enquiry.</p>
            </li>
            <li>
              <span>Response</span>
              <p>You will receive updates and requests through chat.</p>
            </li>
            <li>
              <span>Decision</span>
              <p>Approve, reject, or request changes when ready.</p>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
