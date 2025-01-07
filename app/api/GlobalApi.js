const { default: axios } = require("axios");

// Set a global timeout of 35 seconds (35000 milliseconds)
// axios.defaults.timeout = 35000; // 35 seconds
const token =
  typeof window !== "undefined" ? localStorage.getItem("token") : null;

const CreateNewUser = (data) => axios.post("/api/user", data);
const LoginUser = (data) => axios.post("/api/login", data);
const GetUser = (token) =>
  axios.get("/api/getUser", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

const CreateNewsArticle = (formData) => {
  return axios.post(`/api/createNewsArticle`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      // 'Content-Type': 'multipart/form-data',
    },
  });
};

const GetNewsCategories = (token) => {
  return axios.get(`/api/getNewsCategories`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const CreateNewsCategory = (data) => {
  return axios.post(`/api/createNewsCategory`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const DeleteNewsCategory = (data) => {
  return axios.delete(`/api/deleteNewsCategory`, {
    data,
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetNewsCount = (token) => {
  return axios.get(`/api/getNewsCount`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetLearnSubjects = (token) => {
  return axios.get(`/api/getLearnSubjects`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const CreateLearnQuiz = (formData) => {
  return axios.post(`/api/createLearnQuiz`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const CreateLearnTopic = (formData) => {
  return axios.post(`/api/CreateLearnTopic`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const FetchChallenges = async (data) => {
  return axios.post(`/api/fetchChallenges`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// New function to fetch news
const FetchNews = async (data) => {
  return axios.post(`/api/fetchNews`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
// New function to fetch news
const FetchNews2 = async (data) => {
  return axios.post(`/api/adult/fetchNews`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const FetchNewsReports = (newsId) => {
  return axios.get(`/api/fetchNewsReports/${newsId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const DeleteNewsArticle = (id) => {
  return axios.delete("/api/deleteNewsArticle", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { id },
  });
};

const DeleteNewsArticle2 = (id) => {
  return axios.delete("/api/adult/deleteNewsArticle", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    data: { id },
  });
};

const DeleteWholeNews = (id) => {
  return axios.post(
    "/api/deleteWholeNews",
    { id },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const FetchActivities = (age, type) => {
  return axios.get(`/api/fetchActivities`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      age,
      type,
    },
  });
};

const FetchAllUsers = () => {
  return axios.get(`/api/fetchUsers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const FetchUserChildren = (userId) => {
  return axios.get(`/api/fetchUserChildren/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const FetchUserChallenges = (age, entryType, submissionStatus) => {
  return axios.get(`/api/fetchUserChallenges`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      age,
      entryType,
      submissionStatus,
    },
  });
};

const UpdateChallengeStatus = async (challengeId, status) => {
  return axios.post(
    `/api/updateChallengeStatus`,
    { challengeId, status },
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    }
  );
};

export default {
  CreateNewUser,
  LoginUser,
  GetUser,

  /* News */
  CreateNewsArticle,
  GetNewsCategories,
  CreateNewsCategory,
  DeleteNewsCategory,
  FetchNews,
  FetchNewsReports,
  DeleteNewsArticle,
  GetNewsCount,
  DeleteWholeNews,
  // Adult

  FetchNews2,
  DeleteNewsArticle2,
  /* Learn */
  GetLearnSubjects,
  CreateLearnQuiz,
  CreateLearnTopic,
  FetchChallenges,

  /* Activities */
  FetchActivities,

  /* Users */
  FetchAllUsers,
  FetchUserChildren,

  /* Challenges */
  FetchUserChallenges,
  UpdateChallengeStatus,
};
