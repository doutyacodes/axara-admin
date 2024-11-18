import axios from "axios";

const SearchUser = (token, data) => {
  // console.log(token)
  if (token) {
    return axios.post("/api/search", data, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
  } else {
    return axios.post("/api/search", data);
  }
};

const SignUpUser = (data) => axios.post("/api/signup", data);
const LoginUser = (data) => axios.post("/api/login", data);

// New functions to fetch and add children
const GetUserChildren = async () => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.get("/api/children", {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const GetKidsPost = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post("/api/kids_posts", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const UpdateUserData = async (token, data) => {
  return axios.post("/api/updateUserData", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const UpdateChildData = async (token, data) => {
  return axios.post("/api/UpdateChildData", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const KidsLikes = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post("/api/like", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const addComment = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post("/api/kid_post", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const getComments = async (postId, page = 1) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.get(`/api/kid_post?postId=${postId}&page=${page}`, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const deleteComment = async (commentId) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.delete(`/api/kid_post`, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
    data: { commentId },
  });
};

const updateComment = async (commentId, commentText) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.patch(
    `/api/kid_post`,
    { commentId, commentText },
    {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    }
  );
};

const AddChild = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage
  return axios.post("/api/children/add", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const GetQuizData = (id, token, selectedChildId) => {
  return axios.post(
    `/api/getQuizData`,
    {
      id: id,
      childId: selectedChildId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const GetQuizData3 = (
  id,
  token,
  selectedChildId,
  selectedAge,
  selectedWeeks
) => {
  return axios.post(
    `/api/GetQuizData3`,
    {
      id: id,
      childId: selectedChildId,
      ages: selectedAge,
      weekData: selectedWeeks,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const GetQuizData2 = (id, token, selectedChildId) => {
  return axios.post(
    `/api/getQuizData2`,
    {
      id: id,
      childId: selectedChildId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const GetQuizData5 = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage
  return axios.post("/api/learn/quiz", data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const GetLearnTopics = async (data) => {
  return axios.post("/api/learn", data);
};
const GetLearnTopicsData = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  if (token) {
    return axios.post("/api/learn/learn_topic", data, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
  } else {
    return axios.post("/api/learn/learn_topic", data);
  }
};

// New function to fetch courses
const FetchCourses = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/fetchcourse`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
// New function to fetch subjects
const FetchSubjects = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/fetchSubjects`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
// New function to fetch news
const FetchNews = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/fetchNews`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const fetchNewsHome = async (token,data) => {

  if(token)
  {
    return axios.post(`/api/fetchNewsHome`, data, {
      headers: {
        Authorization: `Bearer ${token}`, // Include the token in the Authorization header
      },
    });
  }else{
    return axios.post(`/api/fetchNewsHome`, data);
  }
};

// New function to fetch courses
const FetchActivities = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/fetchActivities`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const submitImage = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/activityUpload2`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

// New function to fetch courses
const FetchSubtopics = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/subtopics`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const SubmitQuizAnswers = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/learn/submit-quiz`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const getChildBadges = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/badges`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const getSingleBadge = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/badges/singlebadge`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};
const getPostBySlug = async (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/fetchPosts`, data, {
    headers: {
      Authorization: `Bearer ${token}`, // Include the token in the Authorization header
    },
  });
};

const GetDashboarCheck = (selectedChildId, selectedAge, selectedWeeks) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(
    `/api/getDashboardCheckData`,
    {
      childId: selectedChildId,
      ages: selectedAge,
      weeks: selectedWeeks,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const SaveQuizProgress = (data, quizId, selectedChildId) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  const payload = {
    quizId,
    childId: selectedChildId,
    results: data,
  };
  return axios.post(`/api/quizProgress`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const SaveQuizProgress3 = (
  data,
  quizId,
  selectedChildId,
  selectedWeeks,
  selectedAge
) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  const payload = {
    quizId,
    childId: selectedChildId,
    results: data,
    ages: selectedAge,
    weekData: selectedWeeks,
  };
  return axios.post(`/api/quizProgress3`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const SaveQuizProgress2 = (data, quizId, selectedChildId) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  const payload = {
    quizId,
    childId: selectedChildId,
    results: data,
  };
  return axios.post(`/api/commonProgress`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const SaveQuizResult = (selectedChildId) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(
    "/api/quizResult",
    {
      childId: selectedChildId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const SaveQuizResult3 = (
  selectedChildId,
  datatoken,
  selectedAge,
  selectedWeeks
) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(
    "/api/quizResult3",
    {
      childId: selectedChildId,
      ages: selectedAge,
      weekData: selectedWeeks,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const SaveQuizResult2 = (selectedChildId) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(
    "/api/quizResult2",
    {
      childId: selectedChildId,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

const SaveCarrerData = (token, data) => {
  return axios.post(`/api/saveCareers`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetCarrerData = (token) => {
  return axios.get(`/api/getCareers`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const SaveInterestedCareer = (token, careerName, country) => {
  const payload = {
    career: careerName,
    country: country,
  };

  return axios.post(`/api/saveInterestedCareers`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetCommunityPosts = (token, id) => {
  return axios.get(`/api/getCommunityPosts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetTestResultData = (token) => {
  return axios.get(`/api/getTestResultData/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetContestResultData = (token) => {
  return axios.get(`/api/getContestResultData/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetUserData = (token) => {
  return axios.get("/api/getUserData", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const UpdateUser = (data, token) => {
  return axios.put("/api/updateUser", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getCareerName = (id) => {
  return axios.get(`/api/getCareerName/${id}`);
};

const GetResult2 = (token, industryParam, language) =>
  axios.get("/api/getresult2", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept-Language": language,
    },
    params: {
      industry: industryParam,
    },
  });

const getResult2Career = (token, career_name, language) =>
  axios.get("/api/getResult2Career", {
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept-Language": language,
    },
    params: {
      career_name: career_name,
    },
  });

const getActivities = (id, token) => {
  return axios.get(`/api/getActivity/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const updateActivityStatus = (token, activityId, status) => {
  const payload = {
    activityId,
    status,
  };

  return axios.post(`/api/updateActivityStatus`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetCareerPath = (id, token, language) => {
  return axios.get(`/api/getCareerPath/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept-Language": language,
    },
  });
};

const GetCareerQuiz = () => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(
    `/api/getPersonalityDataKids`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};
const GetCareerQuizKids = (id, token) => {
  return axios.get(`/api/getPersonalityDataKids/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const SaveCarrierQuizProgress = (data, quizId, selectedChildId) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  const payload = {
    quizId,
    results: data,
    childId: selectedChildId,
  };

  return axios.post(`/api/carrierQuizProgress`, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const SaveCareerQuizResult = (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/CareerQuizResult`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const learnStyleResult = (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/learnStyleResult`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const getQuizResults = (data) => {
  const token = localStorage.getItem("token"); // Adjust based on your auth token storage

  return axios.post(`/api/getQuizResults`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetIndustry = (token, language) => {
  return axios.get(`/api/getIndustry`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Accept-Language": language,
    },
  });
};

const GetDaysData = (token, childId) => {
  return axios.get(`/api/learn/getDaysData/${childId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const GetFeedbacksData = (month, year, week, childId, token,) => {
  return axios.get(`/api/learn/getFeedbackData/${childId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },params: {
      month,
      year,
      week,
    },
  });
};


export default {
  SearchUser,
  SignUpUser,
  LoginUser,
  GetUserChildren, // Export the new function
  AddChild, // Export the new function
  FetchCourses, // Export the new function
  FetchSubjects,
  FetchSubtopics,
  GetLearnTopics,
  learnStyleResult,
  GetLearnTopicsData,
  GetQuizData,
  GetQuizData5,
  GetQuizData2,
  GetQuizData3,
  SaveQuizResult3,
  SubmitQuizAnswers,
  getChildBadges,
  getQuizResults,
  getSingleBadge,
  GetDashboarCheck,
  SaveQuizProgress,
  SaveQuizProgress3,
  UpdateUserData,
  UpdateChildData,
  FetchNews,
  fetchNewsHome,
  SaveQuizResult,
  SaveQuizResult2,
  SaveCarrerData,
  GetCarrerData,
  SaveInterestedCareer,
  GetCommunityPosts,
  GetTestResultData,
  GetContestResultData,
  GetUserData,
  UpdateUser,
  getCareerName,
  GetResult2,
  getResult2Career,
  getActivities,
  updateActivityStatus,
  GetCareerPath,
  GetCareerQuiz,
  GetCareerQuizKids,
  GetKidsPost,
  KidsLikes,
  addComment,
  getComments,
  deleteComment,
  updateComment,
  getPostBySlug,
  SaveCarrierQuizProgress,
  SaveCareerQuizResult,
  GetIndustry,
  FetchActivities,
  submitImage,

  SaveQuizProgress2,
  GetFeedbacksData,
  GetDaysData,
};
