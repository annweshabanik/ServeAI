import express,{Request,Response} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

//health check route
app.get('/api/health', (req:Request,res:Response) => {
    res.json({
        status:'online',
        message: 'ServeAI Backend Server is running smoothly!!!',
        timestamp: new Date().toISOString()
    })
})

//start server
app.listen(PORT, ()=>{
    console.log(`ServeAI Backend is running on https:/localhost:${PORT}`);
})

