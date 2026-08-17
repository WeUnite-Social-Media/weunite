-- V7: Add performance indexes for notification queries and user presence lookup.
--
-- tb_notification:
--   (recipient_id, is_read)      -- unread count and unread-first listing
--   (recipient_id, created_at)   -- paginated notification history per user
--   (type, related_entity_id)    -- type-scoped lookups used by comment/post notification flows
--
-- user_presence:
--   (user_id)                    -- already the PK, index is implicit; listed here for audit clarity
--   No additional index needed since user_id is the PK and every lookup goes by PK.

CREATE INDEX IF NOT EXISTS idx_notification_recipient_read
    ON tb_notification (user_id, is_read);

CREATE INDEX IF NOT EXISTS idx_notification_recipient_created
    ON tb_notification (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_notification_type_entity
    ON tb_notification (type, related_entity_id);
