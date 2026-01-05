import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children }) => {
    return (
        <div className="flex bg-[var(--bg-main)] min-h-screen transition-colors duration-400">
            <Sidebar />
            <div className="flex-1 ml-64 flex flex-col min-h-screen">
                <Header />
                <main className="flex-1 p-10 pt-24">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
