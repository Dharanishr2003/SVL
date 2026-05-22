import{u as Ge,i as qe,a as Ke,r as n,d as We,b as de,c as G,j as a,C as Je,f as j,ar as Qe,v as me,g as Xe,s as Ze}from"./index-DjS819Ht.js";import{c as ea}from"./userAdminApi-BoiS688O.js";import{g as aa}from"./branchesApi-DOIAaDgO.js";import{g as sa}from"./departmentsApi-9BoS3duD.js";import{g as ta}from"./designationsApi-j6l81AEK.js";import{g as na}from"./headOfficesApi-CUVE4u7O.js";/* empty css                       *//* empty css                      */const ra=["SUPER_ADMIN","ADMIN","MANAGER","TEAM_LEAD","EMPLOYEE"],pe="".trim(),la=pe?pe.split(",").map(b=>b.trim()).filter(Boolean):ra,ia={SUPER_ADMIN:["ADMIN","MANAGER","TEAM_LEAD","EMPLOYEE"],ADMIN:["MANAGER","TEAM_LEAD","EMPLOYEE"],MANAGER:["TEAM_LEAD","EMPLOYEE"],TEAM_LEAD:["EMPLOYEE"]},oa={username:"",email:"",firstName:"",lastName:"",phone:"",role:"EMPLOYEE",password:"",confirmPassword:""};function xa(){const b=Ge(),{user:ue}=qe(),{showSuccess:he,showError:i}=Ke(),q=String(ue?.role||"").toUpperCase(),fe=["Scope & Employee","Account Details"],[r,o]=n.useState(oa),[f,R]=n.useState(0),[x,K]=n.useState(!1),[h,W]=n.useState(We?.value||"+91"),[B,T]=n.useState(""),[N,J]=n.useState(!1),[p,ge]=n.useState(""),[c,k]=n.useState(""),[u,E]=n.useState(""),[y,v]=n.useState(""),[C,Q]=n.useState(""),[X,xe]=n.useState([]),[Z,U]=n.useState([]),[_,z]=n.useState([]),[F,w]=n.useState([]),[A,ee]=n.useState([]),[Ne,ae]=n.useState(!1),[ye,se]=n.useState(!1),[je,te]=n.useState(!1),[be,ne]=n.useState(!1),[re,le]=n.useState(!1),I=String(r.role||"EMPLOYEE").toUpperCase(),D=I!=="ADMIN",M=["TEAM_LEAD","EMPLOYEE"].includes(I),H=de(h)||15;n.useMemo(()=>{const e=G(h);return e.length?e.join(" or "):H},[h,H]);const P=n.useMemo(()=>{const e=new Set(la.map(s=>String(s||"").trim().toUpperCase()));return(ia[q]||[]).filter(s=>e.has(s))},[q]);n.useEffect(()=>{P.length>0&&o(e=>({...e,role:P[0]}))},[P]),n.useEffect(()=>{let e=!0;return(async()=>{ae(!0);try{const t=await na();e&&xe(Array.isArray(t)?t:[])}catch(t){e&&i(j(t,"Failed to load head offices"))}finally{e&&ae(!1)}})(),()=>{e=!1}},[i]),n.useEffect(()=>{if(!p){U([]),k("");return}let e=!0;return(async()=>{se(!0);try{const t=await aa(p);e&&U(Array.isArray(t)?t:[])}catch(t){e&&i(j(t,"Failed to load branches"))}finally{e&&se(!1)}})(),()=>{e=!1}},[p,i]),n.useEffect(()=>{if(!c){z([]),E("");return}let e=!0;return(async()=>{te(!0);try{const t=await sa(c);e&&z(Array.isArray(t)?t:[])}catch(t){e&&i(j(t,"Failed to load departments"))}finally{e&&te(!1)}})(),()=>{e=!1}},[c,i]),n.useEffect(()=>{if(!u){w([]),v("");return}let e=!0;return(async()=>{ne(!0);try{const t=await ta(u);e&&w(Array.isArray(t)?t:[])}catch(t){e&&i(j(t,"Failed to load designations"))}finally{e&&ne(!1)}})(),()=>{e=!1}},[u,i]);const Y=n.useMemo(()=>{const e=String(p||"").trim(),s=String(c||"").trim(),t=String(u||"").trim(),d=String(y||"").trim();if(!e||!s)return null;const l={headOfficeId:e,branchId:s};return t&&(l.departmentId=t),d&&(l.designationId=d),l},[p,c,u,y]);n.useEffect(()=>{if(!Y){ee([]);return}let e=!0;return(async()=>{le(!0);try{const t=await Qe(Y);e&&ee(Array.isArray(t)?t:[])}catch(t){e&&i(j(t,"Failed to load available employees"))}finally{e&&le(!1)}})(),()=>{e=!1}},[Y,i]);const ve=X.find(e=>String(e.id)===String(p)),we=Z.find(e=>String(e.id)===String(c)),Se=_.find(e=>String(e.id)===String(u)),Ee=F.find(e=>String(e.id)===String(y)),ie=A.find(e=>String(e.id)===String(C)),S=()=>{Q(""),o(e=>({...e,username:"",email:"",firstName:"",lastName:"",phone:""}))},Ce=e=>{const s=String(e||"EMPLOYEE").toUpperCase();o(t=>({...t,role:s})),S()},ze=e=>{ge(e),k(""),E(""),v(""),U([]),z([]),w([]),S()},Ae=e=>{k(e),E(""),v(""),z([]),w([]),S()},Ie=e=>{E(e),v(""),w([]),S()},De=e=>{v(e),S()},Me=e=>{Q(e);const s=A.find(m=>String(m.id)===String(e));if(!s)return;const d=String(s.name||s.fullName||s.employeeName||"").trim().split(/\s+/).filter(Boolean),l=String(s.email||s.officialEmail||s.personalEmail||"").trim(),g=l.includes("@")?l.split("@")[0]:l,O=String(s.countryCode||"").trim(),L=String(s.phone||s.personalContactNumber||s.alternateContactNumber||"").trim();W(m=>O||m||"+91"),o(m=>({...m,username:g||m.username,email:l||m.email,phone:L.replace(/\D/g,""),firstName:d[0]||m.firstName||"",lastName:d.slice(1).join(" ")||m.lastName||""}))},Pe=e=>{const s=e.replace(/\D/g,""),t=G(h),d=t.length>0?Math.max(...t):de(h)||15;o(l=>({...l,phone:s.slice(0,d)})),T("")},Oe=()=>{T(me(r.phone,h))},Le=e=>{const s=e||"+91",t=Xe(s),d=G(s),l=t?.maxLength||15;W(s),o(g=>({...g,phone:Ze(g.phone,l,d)})),T("")},Re=()=>{if(r.phone&&r.phone.trim()){const e=me(r.phone,h);if(e)return{isValid:!1,message:e}}return{isValid:!0,message:""}},Be=()=>r.phone?`${h}${r.phone}`:"",$=()=>p?c?D&&!u?"Please select a department":M&&!y?"Please select a designation":C?null:"Please select an employee":"Please select a branch":"Please select a head office",Te=()=>r.username.trim()?r.email.trim()?r.password.trim()?r.password!==r.confirmPassword?"Passwords do not match":null:"Password is required":"Email is required":"Username is required",oe=e=>{if(f===0&&e>0){const s=$();if(s){i(s);return}}R(e)},ke=async e=>{e.preventDefault();const s=$();if(s)return i(s);if(f===0){R(1);return}const t=Te();if(t)return i(t);const d=Re();if(!d.isValid)return i(d.message);const l=A.find(V=>String(V.id)===String(C));if(!l)return i("Selected employee is no longer available");const g=String(p||"").trim(),O=String(c||"").trim(),L=String(u||"").trim(),m=String(y||"").trim(),He=String(l.headOfficeId||"").trim(),Ye=String(l.branchId||"").trim(),$e=String(l.departmentMasterId||"").trim(),Ve=String(l.designationMasterId||"").trim();if(g&&He!==g)return i("Selected employee does not belong to the selected head office");if(O&&Ye!==O)return i("Selected employee does not belong to the selected branch");if(D&&L&&$e!==L)return i("Selected employee does not belong to the selected department");if(M&&m&&Ve!==m)return i("Selected employee does not belong to the selected designation");K(!0);try{await ea({employeeId:l.id,username:r.username.trim(),firstName:r.firstName.trim(),lastName:r.lastName.trim(),email:r.email.trim(),phone:Be(),role:String(r.role||"EMPLOYEE").toUpperCase(),headOfficeId:l.headOfficeId||null,branchId:l.branchId||null,departmentId:l.departmentMasterId||null,designationId:l.designationMasterId||null,institution:l.institution||"",departmentName:l.departmentName||"",team:l.team||"",password:r.password,confirmPassword:r.confirmPassword}),he("User created successfully"),b("/useradmin")}catch(V){i(j(V,"Failed to create user"))}finally{K(!1)}},Ue=e=>{f===0&&e.key==="Enter"&&e.preventDefault()},_e=[ve?.name,we?.name,D?Se?.name:null,M?Ee?.name:null].filter(Boolean).join(" / "),Fe=$()===null,ce=!!(p&&c);return a.jsxs("div",{className:"container-fluid user-admin-create-page",children:[a.jsx("style",{children:`
        .user-admin-create-page .wizard-steps {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.75rem;
          margin-bottom: 1rem;
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
          border-color: #45597a;
          box-shadow: 0 10px 24px rgba(69, 89, 122, 0.08);
        }
        .user-admin-create-page .wizard-step-index {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 2rem;
          height: 2rem;
          border-radius: 999px;
          background: #e7edf4;
          color: #45597a;
          font-weight: 700;
          flex: 0 0 auto;
        }
        .user-admin-create-page .wizard-step-button.is-active .wizard-step-index {
          background: #45597a;
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
          padding: 1rem;
          height: 100%;
        }
        .user-admin-create-page .wizard-panel-title {
          font-size: 0.95rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.2rem;
        }
        .user-admin-create-page .wizard-panel-copy {
          color: #667085;
          font-size: 0.84rem;
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
          margin-top: 1rem;
          border: 1px dashed #d9e2ec;
          border-radius: 0.9rem;
          background: #f8fafc;
          padding: 0.85rem 0.95rem;
          color: #667085;
          font-size: 0.84rem;
        }
        @media (max-width: 767.98px) {
          .user-admin-create-page .wizard-steps {
            grid-template-columns: 1fr;
          }
        }
      `}),a.jsxs("div",{className:"card",children:[a.jsxs("div",{className:"card-header d-flex align-items-center justify-content-between flex-wrap gap-2",children:[a.jsxs("div",{children:[a.jsx("h5",{className:"mb-0",children:"Create User"}),a.jsx("small",{className:"text-muted",children:"Use the 2-step wizard to assign scope, choose an employee, and create access."})]}),a.jsx("button",{type:"button",className:"btn btn-outline-secondary",onClick:()=>b("/useradmin"),disabled:x,children:"Back"})]}),a.jsxs("div",{className:"card-body",children:[a.jsx("div",{className:"wizard-steps",children:fe.map((e,s)=>a.jsxs("button",{type:"button",onClick:()=>oe(s),className:`wizard-step-button ${f===s?"is-active":""}`,children:[a.jsx("span",{className:"wizard-step-index",children:s+1}),a.jsxs("span",{children:[a.jsx("span",{className:"wizard-step-title",children:e}),a.jsx("span",{className:"wizard-step-copy",children:s===0?"Scope, role, and employee mapping":"Contact details and credentials"})]})]},e))}),f===0&&a.jsx("div",{children:a.jsxs("div",{className:"row g-3",children:[a.jsx("div",{className:"col-lg-8",children:a.jsxs("div",{className:"wizard-panel",children:[a.jsx("div",{className:"wizard-panel-title",children:"Scope and employee"}),a.jsx("div",{className:"wizard-panel-copy",children:"Choose the org scope, role, and employee in one place."}),a.jsxs("div",{className:"row g-3",children:[a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Role ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsx("select",{className:"form-select",value:r.role,onChange:e=>Ce(e.target.value),children:P.map(e=>a.jsx("option",{value:e,children:e.replace(/_/g," ")},e))})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Head Office ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("select",{className:"form-select",value:p,onChange:e=>ze(e.target.value),disabled:Ne,children:[a.jsx("option",{value:"",children:"Select"}),X.map(e=>a.jsx("option",{value:e.id,children:e.name},e.id))]})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Branch ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("select",{className:"form-select",value:c,onChange:e=>Ae(e.target.value),disabled:!p||ye,children:[a.jsx("option",{value:"",children:"Select"}),Z.map(e=>a.jsx("option",{value:e.id,children:e.name},e.id))]})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Department ",D&&a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("select",{className:"form-select",value:u,onChange:e=>Ie(e.target.value),disabled:!c||_.length===0||je,children:[a.jsx("option",{value:"",children:"Select"}),_.map(e=>a.jsx("option",{value:e.id,children:e.name},e.id))]})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Designation ",M&&a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("select",{className:"form-select",value:y,onChange:e=>De(e.target.value),disabled:!c||!u||F.length===0||be,children:[a.jsx("option",{value:"",children:"Select"}),F.map(e=>a.jsx("option",{value:e.id,children:e.name},e.id))]})]}),a.jsxs("div",{className:"col-12",children:[a.jsxs("label",{className:"form-label",children:["Select Employee ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("select",{className:"form-select",value:C,onChange:e=>Me(e.target.value),disabled:!ce||re,children:[ce?re?a.jsx("option",{value:"",children:"Loading employees..."}):a.jsx("option",{value:"",children:"Select"}):a.jsx("option",{value:"",children:"Complete the scope first"}),A.map(e=>a.jsx("option",{value:e.id,children:e.name},e.id))]})]})]})]})}),a.jsx("div",{className:"col-lg-4",children:a.jsxs("div",{className:"wizard-summary-card",children:[a.jsx("div",{className:"wizard-panel-title",children:"Summary"}),a.jsx("div",{className:"wizard-panel-copy",children:"This preview updates as you pick the scope."}),a.jsxs("div",{className:"wizard-summary-item",children:[a.jsx("span",{className:"wizard-summary-label",children:"Scope"}),a.jsx("span",{className:"wizard-summary-value",children:_e||"Not selected"})]}),a.jsxs("div",{className:"wizard-summary-item",children:[a.jsx("span",{className:"wizard-summary-label",children:"Employee"}),a.jsx("span",{className:"wizard-summary-value",children:ie?.name||"Not selected"})]}),a.jsx("div",{className:"wizard-note",children:I==="ADMIN"?"Admins are assigned at the branch level.":I==="MANAGER"?"Managers are assigned at the branch and department level.":"Team leads and employees are assigned through branch, department, and designation."})]})})]})}),f===1&&a.jsx("form",{id:"user-create-form",onSubmit:ke,onKeyDown:Ue,autoComplete:"off",children:a.jsxs("div",{className:"row g-3",children:[a.jsx("div",{className:"col-lg-8",children:a.jsxs("div",{className:"wizard-panel",children:[a.jsx("div",{className:"wizard-panel-title",children:"Contact and credentials"}),a.jsx("div",{className:"wizard-panel-copy",children:"Use the default field UI here; only the wizard chrome is custom."}),a.jsxs("div",{className:"row g-3",children:[a.jsxs("div",{className:"col-md-6",children:[a.jsx("label",{className:"form-label",children:"First Name"}),a.jsx("input",{className:"form-control",value:r.firstName,onChange:e=>o(s=>({...s,firstName:e.target.value})),placeholder:"First Name"})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsx("label",{className:"form-label",children:"Last Name"}),a.jsx("input",{className:"form-control",value:r.lastName,onChange:e=>o(s=>({...s,lastName:e.target.value})),placeholder:"Last Name"})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Email ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsx("input",{type:"email",className:"form-control",value:r.email,onChange:e=>o(s=>({...s,email:e.target.value})),placeholder:"email@example.com"})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsx("label",{className:"form-label",children:"Mobile Number"}),a.jsxs("div",{className:`employee-phone-input ${B?"employee-phone-input-error":""}`,children:[a.jsx("select",{className:"employee-phone-code",value:h,onChange:e=>Le(e.target.value),children:Je.map(e=>a.jsx("option",{value:e.value,children:e.value},`${e.country}-${e.callingCode}`))}),a.jsx("input",{type:"tel",className:"employee-phone-number",value:r.phone||"",onChange:e=>Pe(e.target.value),onBlur:Oe,placeholder:`Enter ${H} digit number`})]}),B&&a.jsx("small",{className:"text-danger mt-1 d-block",children:B})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Username ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsx("input",{className:"form-control",value:r.username,onChange:e=>o(s=>({...s,username:e.target.value})),placeholder:"Username",autoComplete:"new-username"})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Password ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("div",{className:"position-relative",children:[a.jsx("input",{type:N?"text":"password",className:"form-control",value:r.password,onChange:e=>o(s=>({...s,password:e.target.value})),placeholder:"........",autoComplete:"new-password",style:{paddingRight:"2.75rem"}}),a.jsx("button",{type:"button",className:"btn btn-link p-0 text-muted",style:{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",zIndex:10,textDecoration:"none"},onClick:()=>J(e=>!e),"aria-label":N?"Hide password":"Show password",children:a.jsx("i",{className:`ti ${N?"ti-eye-off":"ti-eye"}`,style:{fontSize:"1.1rem"}})})]})]}),a.jsxs("div",{className:"col-md-6",children:[a.jsxs("label",{className:"form-label",children:["Confirm Password ",a.jsx("span",{className:"text-danger",children:"*"})]}),a.jsxs("div",{className:"position-relative",children:[a.jsx("input",{type:N?"text":"password",className:"form-control",value:r.confirmPassword,onChange:e=>o(s=>({...s,confirmPassword:e.target.value})),placeholder:"........",autoComplete:"new-password",style:{paddingRight:"2.75rem"}}),a.jsx("button",{type:"button",className:"btn btn-link p-0 text-muted",style:{position:"absolute",right:"12px",top:"50%",transform:"translateY(-50%)",zIndex:10,textDecoration:"none"},onClick:()=>J(e=>!e),"aria-label":N?"Hide password":"Show password",children:a.jsx("i",{className:`ti ${N?"ti-eye-off":"ti-eye"}`,style:{fontSize:"1.1rem"}})})]})]})]})]})}),a.jsx("div",{className:"col-lg-4",children:a.jsxs("div",{className:"wizard-summary-card",children:[a.jsx("div",{className:"wizard-panel-title",children:"Review"}),a.jsx("div",{className:"wizard-panel-copy",children:"Check the account details before you create the user."}),a.jsxs("div",{className:"wizard-summary-item",children:[a.jsx("span",{className:"wizard-summary-label",children:"Username"}),a.jsx("span",{className:"wizard-summary-value",children:r.username||"Not entered"})]}),a.jsxs("div",{className:"wizard-summary-item",children:[a.jsx("span",{className:"wizard-summary-label",children:"Email"}),a.jsx("span",{className:"wizard-summary-value",children:r.email||"Not entered"})]}),a.jsxs("div",{className:"wizard-summary-item",children:[a.jsx("span",{className:"wizard-summary-label",children:"Employee"}),a.jsx("span",{className:"wizard-summary-value",children:ie?.name||"Not selected"})]})]})})]})})]}),a.jsx("div",{className:"card-footer d-flex justify-content-end gap-2",children:f===0?a.jsxs(a.Fragment,{children:[a.jsx("button",{type:"button",className:"btn btn-light",onClick:()=>b("/useradmin"),disabled:x,children:"Cancel"}),a.jsx("button",{type:"button",className:"btn btn-primary",onClick:()=>oe(1),disabled:x||!Fe,children:"Next"})]}):a.jsxs(a.Fragment,{children:[a.jsx("button",{type:"button",className:"btn btn-light",onClick:()=>R(0),disabled:x,children:"Previous"}),a.jsx("button",{type:"submit",form:"user-create-form",className:"btn btn-primary",disabled:x,children:x?"Creating...":"Create User"})]})})]})]})}export{xa as default};
