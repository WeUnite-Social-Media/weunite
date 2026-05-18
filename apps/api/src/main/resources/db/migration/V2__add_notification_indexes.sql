create index if not exists idx_notification_user_created_at
  on tb_notification (user_id, created_at desc);

create index if not exists idx_notification_user_read
  on tb_notification (user_id, is_read);

create index if not exists idx_notification_type
  on tb_notification (type);

create index if not exists idx_notification_actor_id
  on tb_notification (actor_id);

create index if not exists idx_notification_related_entity_id
  on tb_notification (related_entity_id);
