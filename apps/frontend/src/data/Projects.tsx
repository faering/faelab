import { ExternalLink, Star } from 'lucide-react';
import GitHubIcon from '../../icons/GitHub Mark/SVG/GitHub_Invertocat_Black.svg';
import { portfolioConfig } from '../config/portfolioExample';


export const projects = [
    {
        id: "1",
        title: "E-Commerce Platform",
        description: "A full-featured e-commerce solution with real-time inventory, payment processing, and admin dashboard. Built with modern technologies for scalability and performance.",
        image: "https://images.pexels.com/photos/230544/pexels-photo-230544.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["e-commerce", "dashboard", "payments", "admin"],
        techStack: ["React", "Node.js", "PostgreSQL", "Stripe"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
    },
    {
        id: "2",
        title: "Task Management App",
        description: "Collaborative project management tool with real-time updates, team chat, and advanced analytics. Designed for remote teams and agile workflows.",
        image: "https://images.pexels.com/photos/3183197/pexels-photo-3183197.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["productivity", "team", "analytics", "chat"],
        techStack: ["Next.js", "TypeScript", "Supabase", "Tailwind"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: false
    },
    {
        id: "3",
        title: "Weather Dashboard",
        description: "Beautiful weather application with location-based forecasts, interactive maps, and weather alerts. Features a responsive design and offline capabilities.",
        image: "https://images.pexels.com/photos/1118873/pexels-photo-1118873.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["weather", "dashboard", "maps", "alerts"],
        techStack: ["React", "OpenWeather API", "Chart.js", "PWA"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: false
    },
    {
        id: "4",
        title: "Social Media Analytics",
        description: "Comprehensive analytics platform for social media managers. Track engagement, analyze trends, and generate detailed reports across multiple platforms.",
        image: "https://images.pexels.com/photos/590016/pexels-photo-590016.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["analytics", "social media", "reports", "trends"],
        techStack: ["Vue.js", "Python", "FastAPI", "MongoDB"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: true
    },
    {
        id: "5",
        title: "Learning Management System",
        description: "Educational platform with course creation tools, progress tracking, and interactive assessments. Supports video streaming and real-time collaboration.",
        image: "https://images.pexels.com/photos/159711/books-bookstore-book-reading-159711.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["education", "courses", "video", "collaboration"],
        techStack: ["React", "Firebase", "Material-UI", "WebRTC"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: false
    },
    {
        id: "6",
        title: "Cryptocurrency Tracker",
        description: "Real-time cryptocurrency tracking application with portfolio management, price alerts, and market analysis. Features a modern, intuitive interface.",
        image: "https://images.pexels.com/photos/844124/pexels-photo-844124.jpeg?auto=compress&cs=tinysrgb&w=800",
        tags: ["crypto", "tracker", "portfolio", "finance"],
        techStack: ["React Native", "Redux", "CoinGecko API", "AsyncStorage"],
        repoUrl: "https://github.com",
        liveUrl: "https://example.com",
        featured: false
    }
];