# Overview

Project includes:

- Next.js (default setup, never used as web UI is not reauired by the task)
- Express.js (handles endpoints)
- MongoDB (tasks storage)

Supported API endpoints:

- Create a task
- Delete a task
- Update Name, Status or Due Date
- Complete a task
- Get tasks:
  - All
  - All of the same status
  - All sorted by Start date (old first)
  - All sorted by Due date (end soon first)
  - All sorted by Complete date (old first)
  - All matches of a substring
  - One task by its ID

Endpoints include error prevention and data validation.

# Run the project

## Create env file

Create `.env.local` file in the root folder with the next values:

```
MONGODB_URI=mongodb://127.0.0.1:27017/
MONGODB_NAME=todoList
```

## Run the project from the root dirrectory

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

# Tasks collection schema

Besides the document ID each task consist of:

| Field      | Type    | Mandatory | Mutable | Notes                                                            |
| ---------- | ------- | --------- | ------- | ---------------------------------------------------------------- |
| Name       | string  | Yes       | Yes     | Maximum 64 characters                                            |
| Status     | boolean | Yes       | Yes     | Assigned automatically. False for Incomplete, True for complete. |
| Start Date | date    | Yes       | No      | Assigned automatically                                           |
| Due Date   | date    | Yes       | Yes     | Must be equal or more than Start Date                            |
| Done Date  | date    | No        | No      | Assigned automatically                                           |

# Access API

### Get all tasks and filter

```
GET http://localhost:3100/api/tasks

// Filter request (not required)

{
    "name": "substring",
    "status": boolean,
    "sort": "due-date" | "start-date" | "done-date"
}

// Response
{
    "message": "ok",
    "result": [
        {
            "_id": "675e71111a8687727eca1edc",
            "name": "A",
            "status": false,
            "start-date": "2024-12-15T00:00:00.000Z",
            "due-date": "2034-01-22T00:00:00.000Z"
        }
    ]
}
```

### Post a task

```
POST http://localhost:3100/api/task

// JSON
{
    "name": "Task name",
    "due-date": "2034-01-22"
}

// Response
{
    "message": "ok",
    "result": {
        "acknowledged": true,
        "insertedId": "675e71131a8687727eca1edd"
    }
}
```

### Delete a task

```
DELETE http://localhost:3100/api/task/{id}

//Response
{
    message: "ok",
    result: "Task deleted successfully"
}
```

### Complete a task

```
PATCH http://localhost:3100/api/complete/{id}

//Response
{
    "message": "ok",
    "result": {
        "acknowledged": true,
        "modifiedCount": 1,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
    }
}
```

### Edit a task

```
PATCH http://localhost:3100/api/task/{id}

{
    "name": "Task name",
    "status": false,
    "due-date": "2034-01-22"
}

//Response
{
    "message": "ok",
    "result": {
        "acknowledged": true,
        "modifiedCount": 0,
        "upsertedId": null,
        "upsertedCount": 0,
        "matchedCount": 1
    }
}
```
