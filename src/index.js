import axios from "axios";
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import Notiflix from "notiflix";

const notiflixParamsFailure = {
    width: '520px',
    svgSize: '200px',
    position: 'center-top',
    fontSize: '14px',
    distance: '140px',
    cssAnimationStyle: 'from-top',
}

const notiflixParamsSuccess = {
    width: '520px',
    svgSize: '160px',
    position: 'center-top',
    fontSize: '14px',
    distance: '12px',
    cssAnimationStyle: 'from-top',
}

const refs = {
    searchForm: document.querySelector(".search-form"),
    searchBtn: document.querySelector(".search-btn"),
    gallery: document.querySelector(".gallery"),
    target: document.querySelector(".js-guard"),
    galleryEndNote: document.querySelector(".gallery-end"),
};

let currentPage = 1;
let per_page = 40;
let searchQuery = "";


let options = {
  root: null,
  rootMargin: "300px",
  threshold: 1.0,
};

let observer = new IntersectionObserver(onLoadInfiniteScroll, options);

refs.searchForm.addEventListener("submit", handleSearch);

let lightbox = new SimpleLightbox(".gallery a", {
  captionsData: "alt",
  captionDelay: 250,
});

function onLoadInfiniteScroll(entries, observer) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      currentPage += 1;
      serviceImagesSearch(searchQuery, currentPage)
        .then(({hits, totalHits}) => {
            refs.gallery.insertAdjacentHTML("beforeend", createMarkup(hits));
            lightbox.refresh();
          if (currentPage >= totalHits/per_page) {
              observer.unobserve(refs.target);
              refs.galleryEndNote.textContent = `These were the last pictures about ${searchQuery.toLowerCase()}. Try to look up for something else`;
          }
        })
        .catch((err) => console.log(err));
    }
  });
}

function handleSearch(event) {
    event.preventDefault();
    refs.gallery.innerHTML = "";
    refs.galleryEndNote.textContent = "";
    currentPage = 1;
    searchQuery = event.currentTarget.elements.searchQuery.value.trim();
    if (!searchQuery) {
        Notiflix.Notify.failure("Please, enter your query", notiflixParamsFailure);
        return;
    }
    refs.searchBtn.disabled = true;
    serviceImagesSearch(searchQuery)
        .then(({hits, totalHits}) => {
            if (!hits.length) {
                Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.", notiflixParamsFailure);
                return;
            }
            Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`, notiflixParamsSuccess);
            refs.gallery.innerHTML = createMarkup(hits);
            lightbox.refresh();
            observer.observe(refs.target);
        })
        .catch((error) => {
            console.log(error);
            Notiflix.Notify.failure("Sorry, something went wrong. Please try again.", notiflixParamsFailure);
        })
        .finally(() => {
            refs.searchBtn.disabled = false;
        });
}

async function serviceImagesSearch(searchQuery, page=1) {
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

function createMarkup(arr) {
    return arr
        .map(({ tags, previewURL, likes, views, comments, downloads, largeImageURL}) => `
    <div class="photo-card">
    <a class="gallery__link" href="${largeImageURL}">
    <img src="${previewURL}" alt="${tags}" loading="lazy" />
    </a>
    <div class="info">
        <p class="info-item">
        <b>Likes</b>
        <span>${likes}</span>
        </p>
        <p class="info-item">
        <b>Views</b>
        <span>${views}</span>
        </p>
        <p class="info-item">
        <b>Comments</b>
        <span>${comments}</span>
        </p>
        <p class="info-item">
        <b>Downloads</b>
        <span>${downloads}</span>
        </p>
    </div>
    </div>
    `
    ).join("");
}

