create table if not exists athlete_profile (
  user_id bigint primary key references tb_user(id),
  cpf varchar(255),
  height double precision,
  weight double precision,
  foot_domain varchar(255),
  position varchar(255),
  birth_date date
);

create table if not exists company_profile (
  user_id bigint primary key references tb_user(id),
  cnpj varchar(255)
);

insert into athlete_profile (user_id, cpf, height, weight, foot_domain, position, birth_date)
select id, cpf, height, weight, foot_domain, position, birth_date
from tb_user
where dtype = 'ATHLETE'
and not exists (
  select 1
  from athlete_profile
  where athlete_profile.user_id = tb_user.id
);

insert into company_profile (user_id, cnpj)
select id, cnpj
from tb_user
where dtype = 'COMPANY'
and not exists (
  select 1
  from company_profile
  where company_profile.user_id = tb_user.id
);
