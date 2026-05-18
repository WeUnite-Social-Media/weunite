create index idx_follow_followed_status
  on follow (followed_id, status);

create index idx_follow_follower_status
  on follow (follower_id, status);

create index idx_subscriber_opportunity_id
  on subscriber (opportunity_id);

create index idx_saved_opportunities_athlete_saved_at
  on saved_opportunities (athlete_id, saved_at desc);

create index idx_post_like_comment_id
  on tb_post_like (comment_id);
