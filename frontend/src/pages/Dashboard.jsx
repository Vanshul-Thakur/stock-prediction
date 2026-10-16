import { useState, useEffect } from "react";
import api from "../api/api";
import axios from "axios";
import Navbar from "../components/Navbar";
import SearchBar from "../components/SearchBar"
import StockCard from "../components/StockCard";
import HistoryChart from "../components/HistoryChart";
import PredictionButtons from "../components/PredictionButtons";
import PredictionCard from "../components/PredictionCard";
import LoadingPrediction from "../components/LoadingPrediction";
import Footer from "../components/Footer";
import { useParams } from "react-router-dom";
import.meta.env.VITE_API_URL

export default function Dashboard() {


    const [stock, setStock] = useState(null);

    const [history, setHistory] = useState([]);

    const [prediction, setPrediction] = useState(null);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const { symbol } = useParams();

    useEffect(() => {

        if (symbol) {
            searchStock(symbol);
        }

    }, [symbol]);

    const searchStock = async (symbol) => {
        try {
            setError("");
            setLoading(false);

            const cleanSymbol = symbol.trim().toUpperCase();

            // Get stock details
            const stockResponse = await api.get(
                `/stocks/search/${cleanSymbol}`
            );

            setStock(stockResponse.data);


            // Download history (first time)
            await api.get(
                `/stocks/${cleanSymbol}/history`
            );


            // Fetch history data
            const historyResponse = await api.get(
                `/stocks/${cleanSymbol}/history-data`
            );

            setHistory(historyResponse.data);


        } catch (err) {

            console.log(err.response?.data);

            setError(
                err.response?.data?.detail || "Stock not found."
            );

            setStock(null);
            setHistory([]);
            setPrediction(null);
        }
    };


    //function for predicting tommorow.
    async function predictTomorrow() {

        setLoading(true);

        setPrediction(null);

        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/stocks/${stock.symbol}/predict-lstm/1`
            );

            setPrediction(response.data.predictions[0]);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    }

    //function for predicting for 30 days
    async function predictThirtyDays() {

        setLoading(true);

        setPrediction(null);

        try {

            const response = await axios.get(
                `${import.meta.env.VITE_API_URL}/stocks/${stock.symbol}/predict-lstm/30`
            );

            setPrediction(response.data.predictions);

        } catch (err) {

            console.log(err);

        } finally {

            setLoading(false);

        }

    }

    return (
        // 1. Add flex, flex-col, and min-h-screen to the outer div
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Navbar />

            {/* 2. Add flex-1 to main so it expands and pushes Footer down */}
            <main className="flex-1">
                <div className="p-6 text-center">
                    <h2 className="text-2xl font-semibold">
                        Search the stock you want to predict!
                    </h2>
                </div>
                <div className="mt-6">
                    <SearchBar searchStock={searchStock} />

                    {error && (
                        <p className="mt-3 text-center text-red-600 font-medium">
                            {error}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-12 gap-8 mt-8">
                    <div className="col-span-4 h-full">
                        <StockCard stock={stock} />
                    </div>

                    <div className="col-span-8 h-full">
                        <HistoryChart
                            history={history}
                            prediction={prediction}
                        />
                    </div>
                </div>

                <div className="mt-10 flex justify-center">
                    {loading ? (
                        <LoadingPrediction />
                    ) : (
                        stock && (
                            <PredictionButtons
                                predictTomorrow={predictTomorrow}
                                predictThirtyDays={predictThirtyDays}
                            />
                        )
                    )}
                </div>

                <div className="mt-8">
                    <PredictionCard
                        prediction={prediction}
                    />
                </div>
            </main>

            <Footer />
        </div>
    );
}