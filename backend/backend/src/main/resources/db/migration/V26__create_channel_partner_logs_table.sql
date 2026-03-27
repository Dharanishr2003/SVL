create table if not exists channel_partner_logs (
    id bigserial primary key,
    channel_partner_id bigint not null,
    log_event varchar(160) not null,
    log_detail varchar(255) not null,
    performed_by varchar(190),
    created_at timestamp not null default now(),
    constraint fk_cp_logs_cp foreign key (channel_partner_id) references channel_partners (id) on delete cascade
);

create index if not exists idx_cp_logs_cp_id on channel_partner_logs (channel_partner_id);
create index if not exists idx_cp_logs_created_at on channel_partner_logs (created_at desc);
