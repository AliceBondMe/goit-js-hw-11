import axios from "axios";

export async function serviceImagesSearch(searchQuery, page = 1, per_page) {
    const BASE_URL = "https://pixabay.com/api/";
    const searchParams = new URLSearchParams({
        key: "39900943-6509e60799bbbff7e734fb1a7",
        q: searchQuery,
        image_type: "photo",
        orientation: "horizontal",
        safesearch: true,
        page: page,
        per_page: per_page,
    });

    const response = await axios.get(`${BASE_URL}?${searchParams}`);
    return response.data;
}