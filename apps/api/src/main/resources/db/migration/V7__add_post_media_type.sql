alter table post
  add column if not exists media_type varchar(20);

update post
set media_type = case
  when image_url like '%/video/upload/%' then 'VIDEO'
  when image_url is not null then 'IMAGE'
  else null
end
where media_type is null;
