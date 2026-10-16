import { useEffect, useState } from "react";
import axios from "axios";
import TrendingList from "../components/TrendingList";
import Navbar from "../components/Navbar";
import.meta.env.VITE_API_URL

function Trending() {

    const [data, setData] = useState(null);

    useEffect(() => {

        axios
            .get(import.meta.env.VITE_API_URL + "/stocks/trending")
            .then((res) => setData(res.data))
            .catch(console.error);

    }, []);

    if (!data) {
        return (
            <>
                <Navbar />
                <h2 className="text-center mt-20 text-2xl">
                    Loading...
                </h2>
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 p-2 flex flex-col">
            <Navbar />
            <div className="max-w-7xl mx-auto p-8">

                <h1 className="text-4xl font-bold mb-8 border-b-2 border-black pb-4">
                    Trending Stocks
                </h1>

                <div className="space-y-8">

                    <TrendingList
                        title="Top Gainers"
                        stocks={data.gainers}
                    />

                    <TrendingList
                        title="Top Losers"
                        stocks={data.losers}
                    />

                    <TrendingList
                        title="Most Active"
                        stocks={data.active}
                    />

                </div>

            </div>
        </div>
    );

}

export default Trending;