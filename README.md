# PingFlix Bot 

You’ve got a list of titles that make your heart hum—a movie you’ve dreamed about since its first trailer, a season drop that’s been on your calendar for months, or an anime debut that’s been whispered about for years. But let’s face it: remembering exactly when they arrive? That’s a job for PingFlix.

You tell it the name of a movie, show, or anime you’re excited about. It goes out, searches the stars (a.k.a. TMDB), and lets you know when your moment arrives. 
You chill. It pings.

[![Deploy with Vercel](https://vercel.com/button)]([https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fhello-world](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FAnkitK-NITB%2Fping-flix-bot&env=BOT_TOKEN,TMDB_API_KEY,SUPABASE_URL,SUPABASE_KEY,CRON_SECRET))



## Technologies Used in PingFlix Bot

### Backend & Runtime:

- Node.js with ES Modules
- Serverless Functions (Vercel)

### APIs & Integration:

- TMDB (The Movie Database) API for movie/TV data
- Telegram Bot API via Telegraf.js
- Supabase for serverless PostgreSQL database


### Infrastructure:

- GitHub Actions for CRON automation
- Vercel for deployment and hosting
- Environment variables for secure configuration


### Key Libraries:

- Telegraf.js for Telegram bot functionality
- Axios for HTTP requests
- @supabase/supabase-js for database operations
- dotenv for environment management

### Development Tools:

- VS Code for development
- Git for version control
- npm for package management



## Architecture (in Pictures)
<details>
  <summary>User Interaction Graph</summary>
  
  This flowchart illustrates how a Telegram user sends a request, interacts with the TMDB API, and stores notifications in the Supabase database.
  <div>
    
``` mermaid
graph
    A[Telegram User] -->|Sends Request| B[Vercel Serverless Function]
    B -->|Sends Search Query| C[TMDB API]
    C -->|Returns Results| B
    B -->|Stores Notification| D[(Supabase Database)]
```
  </div>
</details>

<details>
  <summary>Cron-Triggered Flow</summary>
  This flowchart shows how GitHub Actions triggers daily notifications, fetching due notifications from the Supabase database and sending them to the Telegram user.
  <div>
    
``` mermaid
flowchart
    A[Daily Cron Trigger] --> B{Check Database}
    B -->|New Releases| C[Prepare Notifications]
    C --> D{Send via Telegram API}
    D -->|Success| E[Mark as Notified]
    D -->|Failure| F[Log Error]
    B -->|No Releases| G[Exit]
```
  </div>
</details>
