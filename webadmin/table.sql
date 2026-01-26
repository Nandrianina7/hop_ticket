create table eventPlan (
    id int auto_increment primary key,
    site_name varchar(255) not null,
    created_at date not null,
    metadata json not null,
    organizer_id int,
    foreign key (organizer_id) references `accounts_admin` (`id`)
);

create table eventSite (
    id bigint auto_increment primary key,
    site_name varchar(255) unique not null,
    organizer_id bigint,
    foreign key (organizer_id) references `accounts_admin` (`id`)
) ;

    
create table eventPlan (
    id bigint auto_increment primary key,
    metadata json not null,
    created_at datetime not null,
    site_id bigint,
    foreign key (site_id) references `eventSite` (`id`)
);

create table eventSite_locations(
    id bigint auto_increment primary key,
    location_name varchar(255) not null,
    site_id bigint,
    longitude double not null,
    latitude double not null,
    foreign key (site_id) references `eventSite` (`id`)
);

create table event_locations(
    id bigint auto_increment primary key,
    location_name varchar(255) not null,
    event_id bigint,
    longitude double not null,
    latitude double not null,
    foreign key (event_id) references `api_event` (`id`)
);

create table user_fcmToken(
    id bigint auto_increment primary key,
    fcmtoken varchar(255) unique not null,
    fcm_status boolean not null default true,
    created_at datetime not null default current_timestamp,
    user_id bigint,
    foreign key (user_id) references `accounts_customer` (`id`)

);

create table user_fcmToken(
    id bigint auto_increment primary key,
    fcmtoken varchar(255) unique not null,
    device_type varchar(20),
    created_at datetime not null default current_timestamp,
    updated_at datetime not null default current_timestamp on update current_timestamp,
    user_id bigint,
    foreign key (user_id) references `accounts_customer` (`id`)

);
-- class FCMToken(models.Model):
--     user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="fcm_tokens")
--     token = models.TextField(unique=True)
--     device_type = models.CharField(max_length=20, blank=True, null=True)  # android / ios
--     created_at = models.DateTimeField(auto_now_add=True)
--     updated_at = models.DateTimeField(auto_now=True)

--     def __str__(self):
--         return f"{self.user.username} - {self.token[:20]}"


create or REPLACE VIEW view_event_location as select ae.*,es.site_name,esl.location_name,esl.longitude,esl.latitude from api_event as ae 
join eventSite as es on ae.venue = es.site_name
join eventSite_locations as esl on es.id = esl.site_id;

create or REPLACE VIEW view_future_event_locations as select e.*,el.location_name,el.longitude,el.latitude from api_event as e
join event_locations as el on e.id = el.event_id
where e.event_date > current_timestamp();

create or REPLACE VIEW view_event_likes as select a.*,el.* from api_event_likes as a
join event_locations as el on a.event_id = el.event_id;

alter table api_event_likes
add column created_at datetime not null default current_timestamp;

alter table api_ticket
add column seat_id varchar(100) not null default '';

alter table cinema_restaurantitem add column stock int not null default 0;

create table cinema_historiquestock (
    id bigint auto_increment primary key,
    item_id bigint,
    quantity int not null,
    is_addition boolean not null default false,
    created_at datetime not null default current_timestamp,
    foreign key (item_id) references cinema_restaurantitem (id)
);

create table cinema_restaurantitem_category(
    id bigint auto_increment primary key,
    category_name varchar(100) not null
);

INSERT INTO cinema_restaurantitem_category (category_name) VALUES
  ('POPCORN'),
  ('DRINKS'),
  ('CANDIES'),
  ('SNACKS'),
  ('COMBO');

  INSERT INTO cinema_restaurantitem_category (category_name) VALUES
  ('Bonbons'),
  ('Boissons'),
  ('snacks');

alter table cinema_restaurantitem add column category_id bigint;
alter table cinema_restaurantitem add foreign key (category_id) references cinema_restaurantitem_category(id);

UPDATE cinema_restaurantitem
SET category_id = 2
WHERE id = 16;

ALTER TABLE cinema_restaurantitem
MODIFY COLUMN category varchar(255) NULL;
