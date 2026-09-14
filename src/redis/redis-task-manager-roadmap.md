# Redis Task Manager

## TypeScript + PostgreSQL + Redis — Beginner to Advanced Project Roadmap

### Project Goal

Build a production-style Task Management application while progressively learning Redis through real-world use cases.

The application will use:

* TypeScript
* Node.js
* Fastify
* PostgreSQL
* Drizzle ORM
* Redis
* Docker
* WebSockets
* Background workers
* Vitest
* Redis Streams
* Pub/Sub
* Distributed locking
* Caching
* Rate limiting

The most important principle:

> PostgreSQL is the source of truth. Redis is introduced only when it solves a specific problem better.

---

# 1. Current Architecture

At this point, the application contains:

```text
Client
   |
   v
Fastify API
   |
   +------ PostgreSQL
   |
   +------ Redis
```

PostgreSQL contains:

```text
users
projects
tasks
```

Redis currently handles:

```text
1. Project caching
2. Cache TTL
3. Cache invalidation
4. Rate limiting
```

---

# 2. Current Project Structure

Aim for this structure as the project grows:

```text
redis-task-manager/

├── src/
│   │
│   ├── server.ts
│   │
│   ├── config/
│   │   └── env.ts
│   │
│   ├── db/
│   │   ├── index.ts
│   │   └── schema.ts
│   │
│   ├── redis/
│   │   ├── client.ts
│   │   ├── cache.ts
│   │   ├── rate-limit.ts
│   │   ├── locks.ts
│   │   ├── pubsub.ts
│   │   └── streams.ts
│   │
│   ├── routes/
│   │   ├── user.routes.ts
│   │   ├── project.routes.ts
│   │   ├── task.routes.ts
│   │   └── notification.routes.ts
│   │
│   ├── services/
│   │   ├── user.service.ts
│   │   ├── project.service.ts
│   │   ├── task.service.ts
│   │   └── notification.service.ts
│   │
│   ├── workers/
│   │   ├── notification.worker.ts
│   │   └── report.worker.ts
│   │
│   └── utils/
│
├── tests/
│
├── drizzle/
│
├── docker-compose.yml
├── package.json
└── tsconfig.json
```

Don't create everything immediately.

Add each component when the roadmap reaches it.

---

# PHASE 1 — Complete the Core Application

## Goal

Finish the application without depending heavily on Redis.

### Features

Users:

```text
POST /users
GET /users/:id
```

Projects:

```text
POST /users/:userId/projects
GET /projects/:id
GET /users/:userId/projects
PATCH /projects/:id
```

Tasks:

```text
POST /projects/:projectId/tasks
GET /projects/:projectId/tasks
GET /tasks/:id
PATCH /tasks/:id
DELETE /tasks/:id
```

---

# PHASE 2 — Improve Task Management

Add task states.

```text
TODO
IN_PROGRESS
DONE
```

Database:

```text
tasks
----------------
id
title
description
priority
status
project_id
created_at
updated_at
```

Implement:

```text
PATCH /tasks/:id/status
```

Example:

```json
{
  "status": "IN_PROGRESS"
}
```

Also add:

```text
GET /projects/:id/tasks?status=TODO
GET /projects/:id/tasks?status=DONE
```

### Learning

You'll learn:

* Query filtering
* Database indexes
* Updating records
* API design
* Validation

---

# PHASE 3 — Redis Caching

Already implemented.

Current pattern:

```text
GET project
     |
     v
   Redis
   /   \
 HIT   MISS
  |      |
  |      v
  |  PostgreSQL
  |      |
  |      v
  |    Redis
  |      |
  +------+
     |
     v
 Response
```

Use:

```text
project:<id>
```

Example:

```text
project:1
```

TTL:

```text
60 seconds
```

---

# PHASE 4 — Cache Invalidation

Already implemented.

Whenever:

```text
UPDATE project
```

perform:

```text
UPDATE PostgreSQL
       |
       v
DEL project:<id>
```

The next read repopulates Redis.

### Important concepts

Learn:

* Cache-aside
* TTL
* Stale data
* Cache invalidation
* Source of truth
* Cache consistency

---

# PHASE 5 — Redis Rate Limiting

Already implemented.

Current design:

```text
rate-limit:<ip>
```

Using:

```text
INCR
EXPIRE
```

Current rule:

```text
5 requests / 60 seconds
```

Next improvements:

### User-based rate limiting

Instead of only:

```text
rate-limit:<ip>
```

use:

```text
rate-limit:user:<userId>
```

### Endpoint-based limiting

Use:

```text
rate-limit:<ip>:POST:/users
```

Different APIs can have different limits.

Example:

```text
POST /login       5/min
GET /projects     100/min
POST /tasks       30/min
```

---

# PHASE 6 — Redis Sets: Online Users

Now introduce your first Redis Set.

Goal:

> Track users currently online.

Use:

```text
online-users
```

Commands:

```text
SADD
SREM
SISMEMBER
SMEMBERS
```

When user connects:

```text
SADD online-users user:1
```

When user disconnects:

```text
SREM online-users user:1
```

Check:

```text
SISMEMBER online-users user:1
```

Get everyone:

```text
SMEMBERS online-users
```

---

# PHASE 7 — Project Membership

Use Redis Sets for project membership.

Key:

```text
project:<projectId>:members
```

Example:

```text
project:1:members
```

Store:

```text
user:1
user:2
user:5
```

Operations:

```text
SADD project:1:members user:1
SREM project:1:members user:1
SISMEMBER project:1:members user:1
SMEMBERS project:1:members
```

Now implement:

```text
POST /projects/:id/members/:userId
DELETE /projects/:id/members/:userId
GET /projects/:id/members
```

---

# PHASE 8 — Redis Sorted Sets

This is one of the most important phases.

We already have:

```text
tasks.priority
```

Now create:

```text
project:<projectId>:tasks
```

as a Redis Sorted Set.

Example:

```text
task:1 -> 100
task:2 -> 80
task:3 -> 50
```

Use:

```text
ZADD
ZRANGE
ZREVRANGE
ZREM
ZSCORE
```

Now implement:

```text
GET /projects/:id/tasks/ranked
```

Redis can return the highest-priority tasks efficiently.

---

# PHASE 9 — Understand Why Sorted Sets Matter

Study the concept:

```text
Sorted Set
     |
     +---- Hash Table
     |
     +---- Ordered structure
```

Understand why Redis needs both:

```text
member -> score
```

and:

```text
score -> ordered members
```

Study:

* Skip lists
* O(log N)
* Range queries
* Ranking
* Leaderboards

Then build:

```text
GET /projects/:id/leaderboard
```

where users receive points for completing tasks.

Example:

```text
Alice    950
Bob      720
Charlie  600
```

This gives you a real Redis Sorted Set use case.

---

# PHASE 10 — Pub/Sub

Now introduce real-time notifications.

Scenario:

Alice updates a task.

Bob is watching the project.

We want Bob's browser to receive:

```text
Task #12 was updated by Alice
```

Architecture:

```text
API Server
    |
    | PUBLISH
    v
Redis Pub/Sub
    |
    v
WebSocket Server
    |
    v
Browser
```

Create:

```text
project:1:events
```

Publish:

```text
task.updated
task.created
task.deleted
```

---

# PHASE 11 — WebSockets

Add WebSocket support.

Connection:

```text
Browser
   |
   | WebSocket
   v
API
```

When a task changes:

```text
API
 |
 v
Redis Pub/Sub
 |
 v
WebSocket
 |
 v
All connected clients
```

Now your application becomes real-time.

Features:

```text
Online users
Live task updates
Live notifications
Live project activity
```

---

# PHASE 12 — Notifications

Create a notification model in PostgreSQL.

Example:

```text
notifications
----------------
id
user_id
type
message
read
created_at
```

Redis handles real-time delivery.

PostgreSQL stores permanent notification history.

This gives us:

```text
PostgreSQL
     |
     | permanent
     v
Notification history

Redis
     |
     | real-time
     v
WebSocket
```

This is an important architectural distinction.

---

# PHASE 13 — Redis Lists / Background Jobs

Now introduce asynchronous processing.

Example:

```text
Generate project report
```

Don't make the HTTP request wait 30 seconds.

Instead:

```text
POST /projects/1/report
        |
        v
      Redis
        |
        v
      Worker
        |
        v
Generate report
```

API responds:

```json
{
  "jobId": "abc123",
  "status": "queued"
}
```

Worker processes the job.

---

# PHASE 14 — Build a Worker

Create:

```text
src/workers/report.worker.ts
```

Architecture:

```text
             API
              |
              v
        Redis Queue
              |
              v
           Worker
              |
       ┌──────┴──────┐
       v             v
 PostgreSQL       File/Object
                  Storage
```

Learn:

* Producer
* Consumer
* Queue
* Job state
* Retry
* Failure
* Idempotency

---

# PHASE 15 — Redis Streams

After understanding basic queues, move to Redis Streams.

Learn:

```text
XADD
XREAD
XGROUP
XREADGROUP
XACK
```

Architecture:

```text
Producer
   |
   v
Redis Stream
   |
   +----------+
   |          |
   v          v
Worker A   Worker B
```

Use Streams for:

```text
Activity events
Notifications
Audit events
Background processing
```

---

# PHASE 16 — Consumer Groups

Create:

```text
task-events
```

Consumers:

```text
worker-1
worker-2
worker-3
```

Redis distributes messages between workers.

Learn:

* Consumer groups
* Message acknowledgment
* Pending messages
* Consumer failure
* Recovery

Important commands:

```text
XGROUP
XREADGROUP
XACK
XPENDING
XCLAIM
```

---

# PHASE 17 — Distributed Locking

Now introduce concurrency problems.

Imagine two workers both attempt:

```text
Generate project report
```

You don't want:

```text
Worker A ── generate
Worker B ── generate
```

simultaneously.

Use a Redis lock.

Conceptually:

```text
SET lock:report:1 <token> NX EX 30
```

Meaning:

```text
NX = only if key doesn't exist
EX = expiration
```

Architecture:

```text
Worker A ──┐
           │
           ▼
        Redis Lock
           │
           ├── A gets lock
           │
           └── B rejected
```

Learn:

* Distributed locks
* TTL
* Lock ownership
* Race conditions
* Deadlocks
* Lock expiration

---

# PHASE 18 — Idempotency

Now protect your APIs from duplicate requests.

Example:

```text
POST /payments
```

Client sends:

```text
idempotency-key: abc123
```

Store:

```text
idempotency:abc123
```

in Redis.

If the same request arrives again:

```text
Request
   |
   v
Redis
   |
   +---- exists ---> return previous result
   |
   +---- missing --> process request
```

This is an extremely valuable production pattern.

---

# PHASE 19 — Cache Stampede

Now intentionally create a problem.

Suppose:

```text
project:1
```

expires.

Suddenly 10,000 users request it:

```text
10,000 requests
       |
       v
Redis MISS
       |
       +---- PostgreSQL
       +---- PostgreSQL
       +---- PostgreSQL
       +---- PostgreSQL
       ...
```

PostgreSQL gets hammered.

Learn solutions:

### Locking

Only one request rebuilds the cache.

### Randomized TTL

Instead of:

```text
60 seconds
```

use:

```text
60 + random(0..30)
```

### Background refresh

Refresh before expiration.

This is an important advanced caching problem.

---

# PHASE 20 — Cache-Through / Write-Through Concepts

Compare:

```text
Cache Aside
Write Through
Write Behind
Read Through
```

Understand when each pattern is appropriate.

For this project, keep:

```text
Cache Aside
```

as the primary pattern.

But understand the alternatives.

---

# PHASE 21 — Redis Transactions

Learn:

```text
MULTI
EXEC
WATCH
```

Build a small feature requiring multiple Redis operations.

Example:

```text
Transfer points:

Alice -100
Bob   +100
```

Study:

```text
MULTI
EXEC
```

Then understand optimistic concurrency with:

```text
WATCH
```

---

# PHASE 22 — Lua / Redis Functions

Some operations require multiple commands to behave atomically.

Learn how Redis-side scripting can combine:

```text
GET
SET
INCR
EXPIRE
```

into one atomic operation.

Use this to improve your rate limiter.

The goal is to move from:

```text
INCR
EXPIRE
```

to a more robust atomic implementation.

---

# PHASE 23 — Better Rate Limiting

Implement multiple algorithms.

### Fixed Window

```text
5 requests / minute
```

### Sliding Window

Track request timestamps.

### Token Bucket

Maintain tokens and refill over time.

Compare their:

```text
Accuracy
Memory usage
Complexity
Redis operations
```

This is a great systems-design exercise.

---

# PHASE 24 — Search and Autocomplete

Add project/task search.

For example:

```text
GET /tasks/search?q=redis
```

Initially PostgreSQL handles it.

Then investigate Redis-based approaches.

Learn:

* Prefix indexes
* Sorted sets
* Secondary indexes
* Search architecture

If you want full-text search later, evaluate a dedicated search engine rather than forcing Redis to do everything.

---

# PHASE 25 — Redis Persistence

Now study Redis itself.

Understand:

```text
RDB
AOF
```

Questions to answer:

* What happens if Redis crashes?
* Is Redis data permanent?
* When should Redis be treated as disposable?
* When should Redis persistence be enabled?

For our cache:

```text
Redis data can be lost.
PostgreSQL remains authoritative.
```

For queues:

```text
Durability requirements are different.
```

This distinction matters.

---

# PHASE 26 — Redis Memory Management

Learn:

```text
maxmemory
```

and eviction policies.

Study:

```text
noeviction
allkeys-lru
allkeys-lfu
volatile-lru
volatile-ttl
```

Then configure your development Redis with a small memory limit.

Purpose:

> Understand what happens when Redis runs out of memory.

---

# PHASE 27 — Key Naming Conventions

Establish a consistent naming strategy.

Examples:

```text
project:1
project:1:members
project:1:tasks
project:1:events

user:1
user:1:notifications

rate-limit:127.0.0.1
session:abc123

lock:project:1:report

idempotency:abc123
```

Learn why predictable Redis keys are important.

---

# PHASE 28 — Serialization

Currently we're doing:

```text
JSON.stringify()
JSON.parse()
```

Study:

* JSON
* Memory overhead
* Serialization cost
* Compression
* Alternative representations

Don't prematurely optimize.

Measure first.

---

# PHASE 29 — Redis Observability

Add monitoring.

Learn commands:

```text
INFO
SLOWLOG
MONITOR
MEMORY USAGE
TTL
```

Measure:

```text
Cache hit rate
Cache miss rate
Redis latency
Memory usage
Number of keys
Expired keys
Command frequency
```

Add application metrics:

```text
redis_cache_hit_total
redis_cache_miss_total
redis_command_latency
rate_limit_rejected_total
```

---

# PHASE 30 — Error Handling

Make Redis failure safe.

Current:

```text
API
 |
 v
Redis
 |
 X
Redis unavailable
```

The application should decide what to do.

For cache:

```text
Redis failure
     |
     v
Fall back to PostgreSQL
```

For rate limiting:

```text
Redis failure
     |
     v
Decide whether to fail-open or fail-closed
```

For critical distributed locks:

```text
Redis failure
     |
     v
Do not assume lock exists
```

This is a major production concern.

---

# PHASE 31 — Testing

Add unit tests for:

```text
Cache
Rate limiter
Task service
Project service
Locking
Notifications
```

Add integration tests:

```text
API
 +
PostgreSQL
 +
Redis
```

Test cases:

```text
Cache HIT
Cache MISS
Expired cache
Cache invalidation
Redis unavailable
Rate limit exceeded
Rate limit reset
Duplicate idempotency key
Worker failure
Message retry
```

---

# PHASE 32 — Dockerize Everything

Eventually your development environment should run:

```text
Docker Compose

├── API
├── PostgreSQL
├── Redis
└── Worker
```

Architecture:

```text
                   Docker Network
                        |
       ┌────────────────┼────────────────┐
       |                |                |
       v                v                v
      API          PostgreSQL          Redis
       |
       |
       v
    Worker
```

---

# PHASE 33 — Production Architecture

Eventually aim for:

```text
                       Load Balancer
                            |
                ┌───────────┼───────────┐
                |           |           |
                v           v           v
              API 1       API 2       API 3
                |           |           |
                └───────────┼───────────┘
                            |
                 ┌──────────┴──────────┐
                 |                     |
                 v                     v
              Redis              PostgreSQL
                 |
          ┌──────┼──────┐
          v      v      v
       Worker  Worker  Worker
```

Now you'll understand why Redis becomes extremely useful when applications scale horizontally.

---

# PHASE 34 — Redis High Availability

After you've mastered the previous phases, study:

```text
Redis Sentinel
Redis Cluster
Replication
Sharding
Failover
```

Understand:

```text
Primary
   |
   +---- Replica
   |
   +---- Replica
```

and:

```text
Redis Cluster
     |
     +--- Node 1
     +--- Node 2
     +--- Node 3
```

Don't implement this yourself.

Run it locally and understand how it behaves.

---

# PHASE 35 — Final Project Features

By the end, the application should support:

## Users

```text
Create user
Get user
Authentication/session
Online presence
```

## Projects

```text
Create project
Update project
Delete project
Members
Permissions
Caching
```

## Tasks

```text
Create task
Update task
Delete task
Status
Priority
Ranking
Filtering
```

## Redis

```text
Caching
TTL
Cache invalidation
Rate limiting
Sets
Sorted Sets
Pub/Sub
Streams
Distributed locks
Idempotency
Transactions
Lua/Functions
```

## Real-time

```text
WebSockets
Online users
Live task updates
Notifications
```

## Background processing

```text
Workers
Queues
Streams
Retries
Dead-letter handling
```

---

# FINAL ARCHITECTURE

The completed application should conceptually look like:

```text
                         CLIENTS
                            |
                            v
                     ┌─────────────┐
                     │ Load Balancer│
                     └──────┬──────┘
                            |
             ┌──────────────┼──────────────┐
             |              |              |
             v              v              v
          API 1           API 2           API 3
             |              |              |
             └──────────────┼──────────────┘
                            |
              ┌─────────────┴─────────────┐
              |                           |
              v                           v
        ┌───────────┐              ┌────────────┐
        │   Redis   │              │ PostgreSQL │
        └─────┬─────┘              └────────────┘
              |
       ┌──────┼─────────────────────────┐
       |      |          |              |
       v      v          v              v
     Cache   Sets    Sorted Sets     Streams
       |      |          |              |
       |      |          |              v
       |      |          |           Workers
       |      |          |              |
       |      |          |              v
       |      |          |        Background Jobs
       |      |
       |      v
       |   Presence
       |
       v
   Fast Reads


              Redis Pub/Sub
                   |
                   v
              WebSocket
                   |
                   v
                Clients
```

---

# Recommended Learning Order

Do NOT jump randomly between features.

Follow this order:

```text
01. Core CRUD
        ↓
02. Redis connection
        ↓
03. Cache
        ↓
04. TTL
        ↓
05. Cache invalidation
        ↓
06. Rate limiting
        ↓
07. Redis Sets
        ↓
08. Online presence
        ↓
09. Sorted Sets
        ↓
10. Task ranking
        ↓
11. Pub/Sub
        ↓
12. WebSockets
        ↓
13. Notifications
        ↓
14. Queues
        ↓
15. Workers
        ↓
16. Redis Streams
        ↓
17. Consumer Groups
        ↓
18. Distributed Locks
        ↓
19. Idempotency
        ↓
20. Cache Stampede
        ↓
21. Transactions
        ↓
22. Lua / Redis Functions
        ↓
23. Advanced Rate Limiting
        ↓
24. Persistence
        ↓
25. Memory Management
        ↓
26. Observability
        ↓
27. Testing
        ↓
28. Docker
        ↓
29. High Availability
        ↓
30. Redis Cluster
```

---

# Redis Concepts You Should Be Able to Explain

By the end, you should be able to answer:

### Basics

* What is Redis?
* Why is Redis fast?
* When should I use Redis?
* When should I NOT use Redis?
* Redis vs PostgreSQL?

### Data Structures

* String
* Hash
* List
* Set
* Sorted Set
* Stream
* Bitmap
* HyperLogLog

### Performance

* O(1)
* O(log N)
* Memory usage
* Network latency
* Serialization overhead
* Pipelining

### Distributed Systems

* Cache consistency
* Race conditions
* Distributed locks
* Idempotency
* Rate limiting
* Pub/Sub
* Message delivery
* Consumer groups
* Failure recovery

### Production

* Redis persistence
* Replication
* Sentinel
* Cluster
* Eviction policies
* Memory limits
* Monitoring
* Failover

---

# The Most Important Rule

Don't learn Redis by memorizing commands.

For every Redis feature you implement, ask:

```text
What problem am I solving?

Why Redis?

Why this Redis data structure?

What is the time complexity?

What happens if Redis fails?

What happens when the application scales?

What happens when two requests arrive simultaneously?

What happens when the cache expires?

What happens when 10,000 requests arrive at once?
```

If you can answer those questions, you're learning Redis at a much deeper level than simply knowing:

```text
SET
GET
HSET
SADD
ZADD
XADD
```

---

# Final Milestone

When you're finished, you should be able to look at an application and reason about Redis like this:

```text
Temporary data?
       ↓
      TTL

Repeated expensive reads?
       ↓
      Cache

Unique membership?
       ↓
      Set

Ranking?
       ↓
   Sorted Set

Real-time fan-out?
       ↓
    Pub/Sub

Durable event processing?
       ↓
     Streams

Atomic counter?
       ↓
      INCR

Prevent duplicate work?
       ↓
      Lock

Prevent duplicate requests?
       ↓
   Idempotency

Background processing?
       ↓
 Queue / Streams
```

That is the actual skill we're trying to develop.
