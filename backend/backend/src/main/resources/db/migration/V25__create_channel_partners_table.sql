create table if not exists channel_partners (
    id bigserial primary key,
    cp_id varchar(64) not null unique,
    channel_partner_type varchar(80),
    company_name varchar(200) not null,
    partner_name varchar(200) not null,
    mobile varchar(32) not null,
    office_landline_number varchar(32),
    email_address varchar(190) not null,
    company_registration_number varchar(120),
    registered_address text,
    communication_address text,
    message text,
    website_url varchar(255),
    aadhaar_number varchar(32),
    aadhaar_copy_name varchar(255),
    pan_company varchar(32),
    pan_copy_name varchar(255),
    gst_registration_number varchar(64),
    gst_copy_name varchar(255),
    rera_registration_number varchar(120),
    rera_copy_name varchar(255),
    beneficiary_bank_name varchar(160),
    bank_account_no varchar(80),
    beneficiary_name varchar(160),
    ifsc_code varchar(40),
    status varchar(60) not null default 'Registered',
    is_deleted boolean not null default false,
    created_at timestamp not null default now(),
    updated_at timestamp null
);

create index if not exists idx_channel_partners_deleted on channel_partners (is_deleted);
create index if not exists idx_channel_partners_created_at on channel_partners (created_at desc);
create index if not exists idx_channel_partners_company on channel_partners (company_name);
