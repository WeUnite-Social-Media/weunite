update user_presence
set
  status = case status
    when '0' then 'ONLINE'
    when '1' then 'OFFLINE'
    else upper(status)
  end
where status in ('0', '1', 'online', 'offline');
