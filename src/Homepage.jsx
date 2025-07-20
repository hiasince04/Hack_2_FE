import PopularList from './routes/popular_list';
import Navbar from './Home/Navbar';

export default function HomePage() {
    return (
        <div className="homepage-container">
            <Navbar />
            <main className="homepage-main">
                <PopularList />
            </main>
        </div>
    );
}
