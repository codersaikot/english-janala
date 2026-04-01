# English Janala <img width="25" src="./assets/logo.png" alt="English Janala logo" />

English Janala is a modern English learning web application idea for beginner to intermediate learners. This repository currently contains a frontend MVP that focuses on vocabulary lessons, search, pronunciation, word details, and saved words. This README also acts as your beginner-friendly roadmap from assignment stage to production-ready product.

## Current MVP Features

- Lesson buttons loaded from the provided API
- Vocabulary cards by lesson
- Active lesson button highlighting
- Word details modal
- Safe fallback text for missing API values
- Loading spinner while vocabulary is loading
- Global search by word, meaning, or pronunciation
- Save and remove favorite words with `localStorage`
- Voice pronunciation using `SpeechSynthesis`
- Responsive modern layout

## API Endpoints

### Get all levels

```bash
https://openapi.programming-hero.com/api/levels/all
```

### Get words by level

```bash
https://openapi.programming-hero.com/api/level/{id}
```

Example:

```bash
https://openapi.programming-hero.com/api/level/5
```

### Get word details

```bash
https://openapi.programming-hero.com/api/word/{id}
```

Example:

```bash
https://openapi.programming-hero.com/api/word/5
```

### Get all words

```bash
https://openapi.programming-hero.com/api/words/all
```

## Project Structure

```text
english-janala/
+-- assets/
¦   +-- logo.png
¦   +-- hero-student.png
¦   +-- ...
+-- css/
¦   +-- style.css
¦   +-- tailwind.config.js
+-- js/
¦   +-- app.js
+-- index.html
+-- README.md
```

## What Each File Does

- `index.html`: Main page structure and UI sections
- `css/style.css`: Custom styling, responsive layout, and component design
- `js/app.js`: API calls, UI rendering, search, modal, saved words, and speech logic
- `assets/`: Images and icons used in the UI

## Assignment Checklist

- [x] Show lesson buttons on page load
- [x] Show default vocabulary section text
- [x] Load words by selected lesson
- [x] Show word, meaning, and pronunciation in cards
- [x] Show message when no words are found
- [x] Highlight active lesson button
- [x] Open modal and load word details
- [x] Avoid rendering `undefined` and `null`
- [x] Show loading spinner while fetching
- [x] Search words and reset active lesson
- [x] Save words with heart icon
- [x] Show saved words in a separate section
- [x] Pronounce words using speech synthesis

## Step-by-Step Development Plan

This is the path I recommend if you want to grow this from simple assignment to real product.

### Phase 1: Frontend MVP

1. Build the home page and lesson area
2. Connect to the provided APIs
3. Render level buttons and vocabulary cards
4. Add search, modal, favorites, and speech
5. Make the page responsive for mobile

### Phase 2: Real Product Backend

1. Choose a stack
2. Build authentication
3. Create your own lesson database
4. Track progress per user
5. Add quiz results and bookmarks

### Phase 3: Advanced Learning Features

1. Add English conversation chat
2. Add voice recognition for speaking practice
3. Add daily goals, streaks, badges, and points
4. Add admin panel for content management

## Recommended Tech Stack

If you want a modern scalable version, I recommend this:

- Frontend: React + Vite
- Styling: Tailwind CSS
- Backend: Node.js + Express
- Database: MongoDB for flexibility, or MySQL if you prefer structured relations
- Authentication: JWT + bcrypt
- Deployment: Vercel for frontend, Render or Railway for backend, MongoDB Atlas for database

If you want to stay beginner-friendly and simple:

- Frontend: HTML, CSS, JavaScript
- Backend: Node.js + Express
- Database: MongoDB

## Full Product Folder Structure

Below is a good structure for the production version:

```text
english-janala-fullstack/
+-- client/
¦   +-- public/
¦   +-- src/
¦   ¦   +-- assets/
¦   ¦   +-- components/
¦   ¦   +-- pages/
¦   ¦   +-- layouts/
¦   ¦   +-- hooks/
¦   ¦   +-- services/
¦   ¦   +-- utils/
¦   ¦   +-- context/
¦   ¦   +-- routes/
¦   ¦   +-- main.jsx
+-- server/
¦   +-- src/
¦   ¦   +-- config/
¦   ¦   +-- controllers/
¦   ¦   +-- middleware/
¦   ¦   +-- models/
¦   ¦   +-- routes/
¦   ¦   +-- services/
¦   ¦   +-- utils/
¦   ¦   +-- app.js
¦   ¦   +-- server.js
+-- docs/
+-- .env.example
+-- package.json
+-- README.md
```

## Database Schema

This schema is simple enough for a beginner and strong enough for a real product.

### Users

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| name | String | User full name |
| email | String | Unique |
| password_hash | String | Store hashed password only |
| level | String | Beginner, Intermediate |
| streak_count | Number | Daily learning streak |
| total_points | Number | Gamification score |
| created_at | DateTime | Creation date |

### Lessons

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| title | String | Lesson title |
| level | String | Beginner, Intermediate |
| category | String | Vocabulary, Grammar, Speaking |
| description | String | Short summary |
| is_published | Boolean | Admin control |
| created_at | DateTime | Creation date |

### Words

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| lesson_id | ObjectId / INT | Relation to lesson |
| word | String | English word |
| meaning | String | Native meaning |
| pronunciation | String | Phonetic text |
| example | String | Example sentence |
| audio_url | String | Optional prerecorded audio |
| created_at | DateTime | Creation date |

### Quizzes

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| lesson_id | ObjectId / INT | Related lesson |
| type | String | MCQ, FillBlank |
| question | String | Quiz question |
| options | Array / JSON | Choices for MCQ |
| answer | String | Correct answer |

### UserProgress

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| user_id | ObjectId / INT | Relation to user |
| lesson_id | ObjectId / INT | Relation to lesson |
| completion_percent | Number | 0 to 100 |
| score | Number | Quiz score |
| last_activity_at | DateTime | Last learning time |

### Bookmarks

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| user_id | ObjectId / INT | Relation to user |
| word_id | ObjectId / INT | Relation to word |
| created_at | DateTime | Save date |

### Conversations

| Field | Type | Notes |
| --- | --- | --- |
| id | ObjectId / INT | Primary key |
| user_id | ObjectId / INT | Relation to user |
| prompt | String | User message |
| response | String | AI or system reply |
| created_at | DateTime | Chat time |

## API Design

Here is a clean REST API design for the future full product.

### Authentication

```http
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me
```

### Lessons

```http
GET    /api/lessons
GET    /api/lessons/:id
POST   /api/lessons
PUT    /api/lessons/:id
DELETE /api/lessons/:id
```

### Words

```http
GET    /api/words
GET    /api/words/:id
GET    /api/lessons/:lessonId/words
POST   /api/words
PUT    /api/words/:id
DELETE /api/words/:id
```

### Quizzes

```http
GET    /api/quizzes/:lessonId
POST   /api/quizzes/submit
```

### Progress

```http
GET    /api/progress/me
POST   /api/progress/update
```

### Bookmarks

```http
GET    /api/bookmarks
POST   /api/bookmarks
DELETE /api/bookmarks/:id
```

### Conversation Practice

```http
POST   /api/chat/practice
POST   /api/speaking/evaluate
```

## UI Layout Suggestion

This layout works well for both assignment and full product:

1. Header
2. Hero section with CTA
3. Dashboard summary cards
4. Lesson filter buttons
5. Search bar
6. Vocabulary card grid
7. Saved words section
8. Progress dashboard
9. Conversation practice area
10. Footer

## Sample Backend Code

Here is a simple Express route example:

```js
import express from "express";

const app = express();
app.use(express.json());

app.get("/api/lessons", async (req, res) => {
  const lessons = await Lesson.find().sort({ createdAt: -1 });
  res.json(lessons);
});

app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({
    name,
    email,
    password_hash: hashedPassword,
  });

  res.status(201).json({ message: "User created", user });
});
```

## Sample Frontend Logic

This project already uses this idea in `js/app.js`:

```js
async function loadWordsByLevel(levelId) {
  const response = await fetch(`https://openapi.programming-hero.com/api/level/${levelId}`);
  const data = await response.json();
  renderWordCards(data.data);
}
```

## Deployment Guide

### Push to GitHub

```bash
git init
git add .
git commit -m "Build English Janala MVP"
git branch -M main
git remote add origin https://github.com/your-username/english-janala.git
git push -u origin main
```

### Host the Frontend

Best beginner options:

- GitHub Pages for static HTML/CSS/JS projects
- Vercel for React frontend
- Netlify for static sites and forms

### Host the Backend

- Render
- Railway
- Cyclic

### Database Hosting

- MongoDB Atlas
- PlanetScale
- Railway MySQL

## SEO and Performance Tips

- Use semantic HTML tags like `header`, `main`, `section`, and `footer`
- Add a good page title and description
- Optimize images before upload
- Lazy load large media later if needed
- Keep CSS and JS organized
- Avoid very large libraries unless necessary

## Advanced Features You Can Add Later

- AI chatbot for English conversation
- Speech-to-text speaking practice
- Daily streak and badges
- Admin dashboard for lesson management
- Leaderboard
- Quiz timer
- Lesson recommendation engine

## Mentor Advice

If you are building this alone, do not start with every feature at once. Build in this order:

1. Frontend vocabulary MVP
2. Authentication
3. Database-backed lessons and bookmarks
4. Quiz system
5. Progress tracking
6. AI conversation and speaking practice

This way you always have a working product, and each new feature adds value without breaking the whole project.

## Next Best Step

If you want, the next strong move is to convert this static MVP into a proper React + Node.js full-stack project with:

- login and signup pages
- MongoDB models
- REST API routes
- protected dashboard
- real progress tracking

That would be the right jump from assignment project to production-ready application.
