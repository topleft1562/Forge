import { Circles } from "react-loader-spinner"

export const Spinner = () => {
    return (
        <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#01a8dd]"></div>
        </div>
    )
}