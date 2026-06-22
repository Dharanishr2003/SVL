import{u as na,h as ia,a as la,r,d as oa,b as we,c as Z,j as e,L as Se,C as ca,f as x,ax as da,v as Ee,g as ma,s as ua}from"./index-CI_-0vMR.js";import{c as pa}from"./userAdminApi-qWGskPfU.js";import{g as ha}from"./branchesApi-OxKc0AYa.js";import{g as fa}from"./departmentsApi-VzugLWJ5.js";import{g as ga}from"./designationsApi-BKhdWtkT.js";import{g as xa}from"./headOfficesApi-CLX3egUS.js";import{g as Na,a as ba}from"./userPermissionsApi-BdEPm-t4.js";/* empty css                       *//* empty css                      *//* empty css                  */const ya=["SUPER_ADMIN","ADMIN","MANAGER","TEAM_LEAD","EMPLOYEE"],ze="".trim(),ja=ze?ze.split(",").map(S=>S.trim()).filter(Boolean):ya,va={SUPER_ADMIN:["ADMIN","MANAGER","TEAM_LEAD","EMPLOYEE"],ADMIN:["MANAGER","TEAM_LEAD","EMPLOYEE"],MANAGER:["TEAM_LEAD","EMPLOYEE"],TEAM_LEAD:["EMPLOYEE"]},wa={username:"",email:"",firstName:"",lastName:"",phone:"",role:"EMPLOYEE",password:"",confirmPassword:""};function Oa(){const S=na(),{user:Ce}=ia(),{showSuccess:De,showError:i}=la(),ee=String(Ce?.role||"").toUpperCase(),Ae=["Scope & Employee","Account Details"],[n,o]=r.useState(wa),[N,k]=r.useState(0),[j,ae]=r.useState(!1),[p,se]=r.useState(oa?.value||"+91"),[F,_]=r.useState(""),[v,te]=r.useState(!1),[m,Pe]=r.useState(""),[l,H]=r.useState(""),[u,P]=r.useState(""),[w,E]=r.useState(""),[h,re]=r.useState(""),[b,z]=r.useState(""),[Y,y]=r.useState(""),[ne,Me]=r.useState([]),[ie,V]=r.useState([]),[$,M]=r.useState([]),[G,C]=r.useState([]),[L,le]=r.useState([]),[U,oe]=r.useState([]),[O,ce]=r.useState([]),[Le,de]=r.useState(!1),[Ue,me]=r.useState(!1),[Oe,ue]=r.useState(!1),[Ie,pe]=r.useState(!1),[he,fe]=r.useState(!1),[ge,xe]=r.useState(!1),[Ne,be]=r.useState(!1),D=String(n.role||"EMPLOYEE").toUpperCase(),A=D!=="ADMIN",I=["TEAM_LEAD","EMPLOYEE"].includes(D),R=we(p)||15;r.useMemo(()=>{const a=Z(p);return a.length?a.join(" or "):R},[p,R]);const T=r.useMemo(()=>{const a=new Set(ja.map(s=>String(s||"").trim().toUpperCase()));return(va[ee]||[]).filter(s=>a.has(s))},[ee]);r.useEffect(()=>{T.length>0&&o(a=>({...a,role:T[0]}))},[T]),r.useEffect(()=>{let a=!0;return(async()=>{de(!0);try{const t=await xa();a&&Me(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load head offices"))}finally{a&&de(!1)}})(),()=>{a=!1}},[i]),r.useEffect(()=>{if(!m){V([]),H("");return}let a=!0;return(async()=>{me(!0);try{const t=await ha(m);a&&V(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load branches"))}finally{a&&me(!1)}})(),()=>{a=!1}},[m,i]),r.useEffect(()=>{if(!l){M([]),P("");return}let a=!0;return(async()=>{ue(!0);try{const t=await fa(l);a&&M(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load departments"))}finally{a&&ue(!1)}})(),()=>{a=!1}},[l,i]),r.useEffect(()=>{if(!u){C([]),E("");return}let a=!0;return(async()=>{pe(!0);try{const t=await ga(u);a&&C(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load designations"))}finally{a&&pe(!1)}})(),()=>{a=!1}},[u,i]),r.useEffect(()=>{if(!l||!h){oe([]),z("");return}let a=!0;return(async()=>{xe(!0);try{const t=await Na(l);a&&oe(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load user departments"))}finally{a&&xe(!1)}})(),()=>{a=!1}},[l,h,i]),r.useEffect(()=>{if(!b||!h){ce([]),y("");return}let a=!0;return(async()=>{be(!0);try{const t=await ba(b);a&&ce(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load user designations"))}finally{a&&be(!1)}})(),()=>{a=!1}},[b,h,i]);const q=r.useMemo(()=>{const a=String(m||"").trim(),s=String(l||"").trim(),t=String(u||"").trim(),c=String(w||"").trim();return!a||!s||!t||!c?null:{headOfficeId:a,branchId:s,departmentId:t,designationId:c}},[m,l,u,w]);r.useEffect(()=>{if(!q){le([]);return}let a=!0;return(async()=>{fe(!0);try{const t=await da(q);a&&le(Array.isArray(t)?t:[])}catch(t){a&&i(x(t,"Failed to load available employees"))}finally{a&&fe(!1)}})(),()=>{a=!1}},[q,i]);const ye=ne.find(a=>String(a.id)===String(m)),K=ie.find(a=>String(a.id)===String(l)),Re=$.find(a=>String(a.id)===String(u)),Te=G.find(a=>String(a.id)===String(w)),W=U.find(a=>String(a.id)===String(b)),J=O.find(a=>String(a.id)===String(Y)),je=L.find(a=>String(a.id)===String(h)),B=()=>{re(""),z(""),y(""),o(a=>({...a,username:"",email:"",firstName:"",lastName:"",phone:""}))},Be=a=>{const s=String(a||"EMPLOYEE").toUpperCase();o(t=>({...t,role:s})),s==="ADMIN"?(z(""),y("")):s==="MANAGER"&&y("")},ke=a=>{z(a),y("")},Fe=a=>{y(a)},_e=a=>{Pe(a),H(""),P(""),E(""),V([]),M([]),C([]),B()},He=a=>{H(a),P(""),E(""),M([]),C([]),B()},Ye=a=>{P(a),E(""),C([]),B()},Ve=a=>{E(a),B()},$e=a=>{re(a),z(""),y("");const s=L.find(f=>String(f.id)===String(a));if(!s)return;const c=String(s.name||s.fullName||s.employeeName||"").trim().split(/\s+/).filter(Boolean),d=String(s.email||s.officialEmail||s.personalEmail||"").trim(),g=d.includes("@")?d.split("@")[0]:d,ta=String(s.countryCode||"").trim(),ra=String(s.phone||s.personalContactNumber||s.alternateContactNumber||"").trim();se(f=>ta||f||"+91"),o(f=>({...f,username:g||f.username,email:d||f.email,phone:ra.replace(/\D/g,""),firstName:c[0]||f.firstName||"",lastName:c.slice(1).join(" ")||f.lastName||""}))},Ge=a=>{const s=a.replace(/\D/g,""),t=Z(p),c=t.length>0?Math.max(...t):we(p)||15;o(d=>({...d,phone:s.slice(0,c)})),_("")},qe=()=>{_(Ee(n.phone,p))},Ke=a=>{const s=a||"+91",t=ma(s),c=Z(s),d=t?.maxLength||15;se(s),o(g=>({...g,phone:ua(g.phone,d,c)})),_("")},We=()=>{if(n.phone&&n.phone.trim()){const a=Ee(n.phone,p);if(a)return{isValid:!1,message:a}}return{isValid:!0,message:""}},Je=()=>n.phone?`${p}${n.phone}`:"",Q=()=>m?l?u?w?h?A&&!b?"Please assign a user department permissions scope":I&&!Y?"Please assign a user designation permissions scope":null:"Please select an employee profile":"Please select a physical designation":"Please select a physical department":"Please select a branch":"Please select a head office",Qe=()=>n.username.trim()?n.email.trim()?n.password.trim()?n.password!==n.confirmPassword?"Passwords do not match":null:"Password is required":"Email is required":"Username is required",X=a=>{if(N===0&&a>0){const s=Q();if(s){i(s);return}}k(a)},Xe=async a=>{a&&a.preventDefault&&a.preventDefault();const s=Q();if(s)return i(s);if(N===0){k(1);return}const t=Qe();if(t)return i(t);const c=We();if(!c.isValid)return i(c.message);const d=L.find(g=>String(g.id)===String(h));if(!d)return i("Selected employee is no longer available");ae(!0);try{await pa({employeeId:d.id,username:n.username.trim(),firstName:n.firstName.trim(),lastName:n.lastName.trim(),email:n.email.trim(),phone:Je(),role:String(n.role||"EMPLOYEE").toUpperCase(),headOfficeId:ye?.id||null,branchId:K?.id||null,departmentId:W?.id||null,designationId:J?.id||null,institution:K?.name||"",departmentName:W?.name||"",team:J?.name||"",password:n.password,confirmPassword:n.confirmPassword}),De("User created successfully"),S("/useradmin")}catch(g){i(x(g,"Failed to create user"))}finally{ae(!1)}},Ze=a=>{a.key==="Enter"&&(a.preventDefault(),N===0&&X(1))},ea=[ye?.name,K?.name,Re?.name,Te?.name].filter(Boolean).join(" / "),aa=[A?W?.name:null,I?J?.name:null].filter(Boolean).join(" / "),sa=Q()===null,ve=!!(m&&l&&u&&w);return e.jsxs("div",{className:"content user-admin-create-page",children:[e.jsx("style",{children:`
        .user-admin-create-page .wizard-steps {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .user-admin-create-page .wizard-step-button {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          width: 100%;
          padding: 0.9rem 1rem;
          border: 1px solid #dbe3ec;
          border-radius: 1rem;
          background: #ffffff;
          text-align: left;
        }
        .user-admin-create-page .wizard-step-button.is-active {
          border-color: #3b82f6;
          box-shadow: 0 10px 24px rgba(59, 130, 246, 0.08);
        }
        .user-admin-create-page .wizard-step-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: #e7edf4;
          color: #3b82f6;
          font-weight: 700;
          flex: 0 0 auto;
        }
        .user-admin-create-page .wizard-step-button.is-active .wizard-step-index {
          background: #3b82f6;
          color: #ffffff;
        }
        .user-admin-create-page .wizard-step-title {
          display: block;
          font-size: 0.94rem;
          font-weight: 600;
          color: #1f2937;
        }
        .user-admin-create-page .wizard-step-copy {
          display: block;
          margin-top: 0.15rem;
          font-size: 0.8rem;
          color: #667085;
        }
        .user-admin-create-page .wizard-panel,
        .user-admin-create-page .wizard-summary-card {
          border: 1px solid #e7ecf2;
          border-radius: 1rem;
          background: #ffffff;
          padding: 1.5rem;
          height: 100%;
        }
        .user-admin-create-page .wizard-panel-title {
          font-size: 1rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.2rem;
        }
        .user-admin-create-page .wizard-panel-copy {
          color: #667085;
          font-size: 0.84rem;
          margin-bottom: 1.5rem;
        }
        .user-admin-create-page .wizard-section-divider {
          border-top: 2px dashed #e7edf4;
          margin: 1.5rem 0;
          padding-top: 1.5rem;
        }
        .user-admin-create-page .wizard-section-subtitle {
          font-size: 0.88rem;
          font-weight: 700;
          color: #3b82f6;
          text-transform: uppercase;
          letter-spacing: 0.03em;
          margin-bottom: 1rem;
        }
        .user-admin-create-page .wizard-summary-item + .wizard-summary-item {
          margin-top: 0.75rem;
        }
        .user-admin-create-page .wizard-summary-label {
          display: block;
          margin-bottom: 0.2rem;
          color: #667085;
          font-size: 0.76rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }
        .user-admin-create-page .wizard-summary-value {
          color: #1f2937;
          font-size: 0.92rem;
          font-weight: 600;
        }
        .user-admin-create-page .wizard-note {
          margin-top: 1.5rem;
          border: 1px dashed #d9e2ec;
          border-radius: 0.9rem;
          background: #f8fafc;
          padding: 0.85rem 0.95rem;
          color: #667085;
          font-size: 0.84rem;
        }
        .user-admin-create-page .form-control,
        .user-admin-create-page .form-select {
          border-radius: 8px;
          border: 1px solid #d0d5dd;
          padding: 0.6rem 1rem;
          font-size: 0.95rem;
        }
        .user-admin-create-page .form-control:focus,
        .user-admin-create-page .form-select:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 0.2rem rgba(59, 130, 246, 0.15);
        }
        .user-admin-create-page .form-label {
          color: #34393f;
          font-weight: 600;
          font-size: 0.88rem;
          margin-bottom: 0.4rem;
        }
        @media (max-width: 767.98px) {
          .user-admin-create-page .wizard-steps {
            grid-template-columns: 1fr;
          }
        }
      `}),e.jsx("div",{className:"card border-0 shadow-sm mb-4 bg-white",style:{borderRadius:12},children:e.jsxs("div",{className:"card-body p-4 d-flex justify-content-between align-items-center flex-wrap gap-3",children:[e.jsxs("div",{children:[e.jsx("h3",{className:"fw-bold mb-1 text-slate-800",style:{fontSize:"1.3rem"},children:"Create User"}),e.jsx("nav",{"aria-label":"breadcrumb",children:e.jsxs("ol",{className:"breadcrumb mb-0",style:{fontSize:"0.85rem"},children:[e.jsx("li",{className:"breadcrumb-item",children:e.jsx(Se,{to:"/admin-dashboard",className:"text-muted text-decoration-none",children:e.jsx("i",{className:"ti ti-smart-home"})})}),e.jsx("li",{className:"breadcrumb-item",children:e.jsx(Se,{to:"/useradmin",className:"text-muted text-decoration-none",children:"User Admin"})}),e.jsx("li",{className:"breadcrumb-item active text-primary","aria-current":"page",children:"Create User"})]})})]}),e.jsx("div",{className:"d-flex align-items-center gap-2",children:e.jsx("button",{type:"button",className:"btn btn-outline-secondary d-flex align-items-center gap-2",style:{borderRadius:8},onClick:()=>S("/useradmin"),disabled:j,children:"Back to List"})})]})}),e.jsxs("div",{className:"card border-0 shadow-sm bg-white",style:{borderRadius:12,overflow:"hidden"},children:[e.jsxs("div",{className:"card-body p-4",children:[e.jsx("div",{className:"wizard-steps",children:Ae.map((a,s)=>e.jsxs("button",{type:"button",onClick:()=>X(s),className:`wizard-step-button ${N===s?"is-active":""}`,children:[e.jsx("span",{className:"wizard-step-index",children:s+1}),e.jsxs("span",{children:[e.jsx("span",{className:"wizard-step-title",children:a}),e.jsx("span",{className:"wizard-step-copy",children:s===0?"Profile discovery and role scoping":"Contact details and credentials"})]})]},a))}),N===0&&e.jsx("div",{children:e.jsxs("div",{className:"row g-4",children:[e.jsx("div",{className:"col-lg-8",children:e.jsxs("div",{className:"wizard-panel shadow-none border",children:[e.jsx("div",{className:"wizard-panel-title",children:"Employee Scope Verification"}),e.jsx("div",{className:"wizard-panel-copy",children:"Fill the core corporate matrix to pull matching unlinked staff logs."}),e.jsxs("div",{className:"row g-3",children:[e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Head Office ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("select",{className:"form-select",value:m,onChange:a=>_e(a.target.value),disabled:Le,children:[e.jsx("option",{value:"",children:"Select"}),ne.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Branch ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("select",{className:"form-select",value:l,onChange:a=>He(a.target.value),disabled:!m||Ue,children:[e.jsx("option",{value:"",children:"Select"}),ie.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:[" Department ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("select",{className:"form-select",value:u,onChange:a=>Ye(a.target.value),disabled:!l||$.length===0||Oe,children:[e.jsx("option",{value:"",children:"Select"}),$.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Designation ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("select",{className:"form-select",value:w,onChange:a=>Ve(a.target.value),disabled:!l||!u||G.length===0||Ie,children:[e.jsx("option",{value:"",children:"Select"}),G.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]}),e.jsxs("div",{className:"col-12",children:[e.jsxs("label",{className:"form-label",children:["Select Target Employee ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("select",{className:"form-select",value:h,onChange:a=>$e(a.target.value),disabled:!ve||he,children:[ve?he?e.jsx("option",{value:"",children:"Searching branch records..."}):e.jsx("option",{value:"",children:"Select"}):e.jsx("option",{value:"",children:"Complete the physical HRM profile selection above first"}),L.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]})]})]}),h&&e.jsxs("div",{className:"wizard-section-divider",children:[e.jsx("div",{className:"wizard-section-subtitle",children:"Portal Permissions Configuration"}),e.jsxs("div",{className:"row g-3",children:[e.jsxs("div",{className:"col-md-12",children:[e.jsxs("label",{className:"form-label",children:["System Role Access Level ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx("select",{className:"form-select",value:n.role,onChange:a=>Be(a.target.value),children:T.map(a=>e.jsx("option",{value:a,children:a.replace(/_/g," ")},a))})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["User Department Permissions Scope ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx("select",{className:"form-select",value:b,onChange:a=>ke(a.target.value),disabled:!A||U.length===0||ge,children:A?ge?e.jsx("option",{value:"",children:"Loading department scopes..."}):U.length===0?e.jsx("option",{value:"",children:"No user department scopes found for this branch"}):e.jsxs(e.Fragment,{children:[e.jsx("option",{value:"",children:"Select"}),U.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]}):e.jsx("option",{value:"",children:"Broad branch authority applied (Admin)"})})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["User Designation Permissions Scope ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx("select",{className:"form-select",value:Y,onChange:a=>Fe(a.target.value),disabled:!I||!b||O.length===0||Ne,children:A?Ne?e.jsx("option",{value:"",children:"Loading designation scopes..."}):I?O.length===0?e.jsx("option",{value:"",children:"No user designation scopes found for this department"}):e.jsxs(e.Fragment,{children:[e.jsx("option",{value:"",children:"Select"}),O.map(a=>e.jsx("option",{value:a.id,children:a.name},a.id))]}):e.jsx("option",{value:"",children:"Not required for Manager operational scope"}):e.jsx("option",{value:"",children:"Broad branch authority applied (Admin)"})})]})]})]})]})}),e.jsx("div",{className:"col-lg-4",children:e.jsxs("div",{className:"wizard-summary-card shadow-none border",children:[e.jsx("div",{className:"wizard-panel-title",children:"Live Metadata Summary"}),e.jsx("div",{className:"wizard-panel-copy",children:"Tracks active selections across parallel layers."}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"Physical HRM Scope"}),e.jsx("span",{className:"wizard-summary-value",children:ea||"Not selected"})]}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"Target Employee"}),e.jsx("span",{className:"wizard-summary-value",children:je?.name||"Not verified"})]}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"Assigned App Persona"}),e.jsx("span",{className:"wizard-summary-value",children:D.replace(/_/g," ")})]}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"System Portal Target"}),e.jsx("span",{className:"wizard-summary-value",children:aa||"None (Full Branch)"})]}),e.jsx("div",{className:"wizard-note",children:D==="ADMIN"?"Admins inherit root access parameters across all digital operations inside the selected branch anchor.":D==="MANAGER"?"Managers are bounded directly to the targeted digital user department loop.":"Team leads and standard accounts are tied strictly to structural user designation permission sets."})]})})]})}),N===1&&e.jsx("form",{id:"user-create-form",onSubmit:a=>a.preventDefault(),onKeyDown:Ze,autoComplete:"off",children:e.jsxs("div",{className:"row g-4",children:[e.jsx("div",{className:"col-lg-8",children:e.jsxs("div",{className:"wizard-panel shadow-none border",children:[e.jsx("div",{className:"wizard-panel-title",children:"Contact and credentials"}),e.jsx("div",{className:"wizard-panel-copy",children:"Verify extracted identity details and declare secure entry credentials."}),e.jsxs("div",{className:"row g-3",children:[e.jsxs("div",{className:"col-md-6",children:[e.jsx("label",{className:"form-label",children:"First Name"}),e.jsx("input",{className:"form-control",value:n.firstName,onChange:a=>o(s=>({...s,firstName:a.target.value})),placeholder:"First Name"})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsx("label",{className:"form-label",children:"Last Name"}),e.jsx("input",{className:"form-control",value:n.lastName,onChange:a=>o(s=>({...s,lastName:a.target.value})),placeholder:"Last Name"})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Email ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx("input",{type:"email",className:"form-control",value:n.email,onChange:a=>o(s=>({...s,email:a.target.value})),placeholder:"email@example.com"})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsx("label",{className:"form-label",children:"Mobile Number"}),e.jsxs("div",{className:`employee-phone-input ${F?"employee-phone-input-error":""}`,children:[e.jsx("select",{className:"employee-phone-code",value:p,onChange:a=>Ke(a.target.value),children:ca.map(a=>e.jsx("option",{value:a.value,children:a.value},`${a.country}-${a.callingCode}`))}),e.jsx("input",{type:"tel",className:"employee-phone-number",value:n.phone||"",maxLength:R,onChange:a=>Ge(a.target.value),onBlur:qe,placeholder:`Enter ${R} digit number`})]}),F&&e.jsx("small",{className:"text-danger mt-1 d-block",children:F})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Username ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsx("input",{className:"form-control",value:n.username,onChange:a=>o(s=>({...s,username:a.target.value})),placeholder:"Username",autoComplete:"new-username"})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Password ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("div",{className:"position-relative",children:[e.jsx("input",{type:v?"text":"password",className:"form-control",value:n.password,onChange:a=>o(s=>({...s,password:a.target.value})),placeholder:"........",autoComplete:"new-password",style:{paddingRight:"2.75rem"}}),e.jsx("button",{type:"button",className:"btn btn-link p-0 text-muted",style:{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",zIndex:10,textDecoration:"none"},onClick:()=>te(a=>!a),"aria-label":v?"Hide password":"Show password",children:e.jsx("i",{className:`ti ${v?"ti-eye-off":"ti-eye"}`,style:{fontSize:"1.1rem"}})})]})]}),e.jsxs("div",{className:"col-md-6",children:[e.jsxs("label",{className:"form-label",children:["Confirm Password ",e.jsx("span",{className:"text-danger",children:"*"})]}),e.jsxs("div",{className:"position-relative",children:[e.jsx("input",{type:v?"text":"password",className:"form-control",value:n.confirmPassword,onChange:a=>o(s=>({...s,confirmPassword:a.target.value})),placeholder:"........",autoComplete:"new-password",style:{paddingRight:"2.75rem"}}),e.jsx("button",{type:"button",className:"btn btn-link p-0 text-muted",style:{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",zIndex:10,textDecoration:"none"},onClick:()=>te(a=>!a),"aria-label":v?"Hide password":"Show password",children:e.jsx("i",{className:`ti ${v?"ti-eye-off":"ti-eye"}`,style:{fontSize:"1.1rem"}})})]})]})]})]})}),e.jsx("div",{className:"col-lg-4",children:e.jsxs("div",{className:"wizard-summary-card shadow-none border",children:[e.jsx("div",{className:"wizard-panel-title",children:"Review Access Parameters"}),e.jsx("div",{className:"wizard-panel-copy",children:"Perform absolute visual verification before creating database credentials."}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"Username"}),e.jsx("span",{className:"wizard-summary-value",children:n.username||"Not entered"})]}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"Email"}),e.jsx("span",{className:"wizard-summary-value",children:n.email||"Not entered"})]}),e.jsxs("div",{className:"wizard-summary-item",children:[e.jsx("span",{className:"wizard-summary-label",children:"Employee Target"}),e.jsx("span",{className:"wizard-summary-value",children:je?.name||"Not selected"})]})]})})]})})]}),e.jsx("div",{className:"card-footer d-flex justify-content-end gap-2 bg-light p-3 border-top",children:N===0?e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"btn btn-white border",onClick:()=>S("/useradmin"),disabled:j,children:"Cancel"}),e.jsx("button",{type:"button",className:"btn btn-primary",onClick:()=>X(1),disabled:j||!sa,children:"Next"})]}):e.jsxs(e.Fragment,{children:[e.jsx("button",{type:"button",className:"btn btn-white border",onClick:()=>k(0),disabled:j,children:"Previous"}),e.jsx("button",{type:"button",className:"btn btn-primary",onClick:Xe,disabled:j,children:j?"Creating...":"Create User"})]})})]})]})}export{Oa as default};
