alter table channel_partners
    add column if not exists lead_owner_user_id bigint null;

alter table channel_partners
    add column if not exists lead_owner_username varchar(80) null;

create index if not exists idx_channel_partners_lead_owner_user_id on channel_partners (lead_owner_user_id);
