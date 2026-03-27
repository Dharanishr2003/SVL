alter table leads
    add column if not exists channel_partner_id bigint null;

do $$
begin
    if not exists (
        select 1
        from pg_constraint
        where conname = 'fk_leads_channel_partner'
    ) then
        alter table leads
            add constraint fk_leads_channel_partner
                foreign key (channel_partner_id)
                    references channel_partners(id);
    end if;
end $$;

create index if not exists idx_leads_channel_partner_id on leads (channel_partner_id);
