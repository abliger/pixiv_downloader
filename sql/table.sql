create table account(id integer primary key,cookies text,user_id text);

create table img(id integer primary key autoincrement,url text not null,img_id text not null,content text not null);

create table follow_user(id integer primary key autoincrement,user_name text not null,user_id text not null,user_comment text);

create table log(id integer primary key autoincrement,message txt,path text,stack text,create_date text);