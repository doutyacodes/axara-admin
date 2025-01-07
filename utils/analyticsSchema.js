import {
    boolean,
    date,
    datetime,
    decimal,
    float,
    int,
    json,
    mysqlEnum,
    mysqlTable,
    primaryKey,
    text,
    time,
    timestamp,
    uniqueIndex,
    varchar,
  } from "drizzle-orm/mysql-core";
import { ADULT_NEWS } from "./schema";
  
  export const VISITORS = mysqlTable("visitors", {
    id: int("id").primaryKey().autoincrement(),
    uuid: varchar("uuid", { length: 255 }).notNull().unique(), // Unique identifier for each visitor
    first_visit: timestamp("first_visit").defaultNow(), // Timestamp of the first visit
    last_visit: timestamp("last_visit").defaultNow(), // Timestamp of the last visit
    returning_visitor: boolean("returning_visitor").default(false), // Whether the visitor is returning
  });
  
  export const SESSIONS = mysqlTable("sessions", {
    id: int("id").primaryKey().autoincrement(),
    visitor_id: int("visitor_id").notNull().references(() => VISITORS.id), // Reference to visitor
    session_start: timestamp("session_start").defaultNow(), // Session start time
    session_end: timestamp("session_end").default(null), // Session end time (when the user leaves the page)
  });
  
  export const PAGE_VIEWS = mysqlTable("page_views", {
    id: int("id").primaryKey().autoincrement(),
    session_id: int("session_id").notNull().references(() => SESSIONS.id), // Reference to session
    page_url: varchar("page_url", { length: 255 }).notNull(), // The page URL (e.g., article URL)
    time_on_page: int("time_on_page").default(0), // Time spent on the page in seconds
  });
  
  export const ARTICLE_VIEWS = mysqlTable("article_views", {
    id: int("id").primaryKey().autoincrement(),
    article_id: int("article_id").notNull().references(() => ADULT_NEWS.id), // Reference to the article
    session_id: varchar("session_id", { length: 255 }).notNull(), // Session ID of the user (or user ID if authenticated)
    views: int("views").default(0), // Total views for this article
    engagement_time: int("engagement_time").default(0), // Total engagement time (sum of time spent by users on this article)
  });
  
  export const PERSPECTIVE_VIEWS = mysqlTable("perspective_views", {
    id: int("id").primaryKey().autoincrement(),
    article_id: int("article_id").notNull().references(() => ADULT_NEWS.id), // Reference to the article
    viewpoint: varchar("viewpoint", { length: 255 }).notNull(), // Perspective/viewpoint name (e.g., Political, Positive, Negative)
    views: int("views").default(0), // Total views for this viewpoint
    engagement_time: int("engagement_time").default(0), // Total engagement time for this perspective
    session_id: varchar("session_id", { length: 255 }).notNull(), // Session ID of the user (or user ID if authenticated)
  });
  