# Create env file

Create `.env.local` file with the next content:

```
MONGODB_URI=mongodb://127.0.0.1:27017/
MONGODB_NAME=todoList
```

# Run the project

Commands you can run from the root dirrectory of the project:

### Install All Dependencies:

`npm install`

### Development Mode:

`npm run dev`

Runs both the Next.js dev server and the Express server concurrently.

frontend runs on http://localhost:3000.
backend runs on http://localhost:3100.

### Build for Production:

`npm run build`

Builds the Next.js project.

### Start Production Servers:

`npm run start`

Starts both the frontend and backend in production mode.
