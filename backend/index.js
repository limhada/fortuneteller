require("dotenv").config();
// 서버리스
const serverless = require("serverless-http");
const { Configuration, OpenAIApi } = require("openai");

// express 코드
const express = require("express");
const app = express();

// cors 사용하기 위해 추가??
var cors = require("cors");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// cors 이슈 해결
let corsOptions = {
  origin: "https://fortuneteller-eqt.pages.dev",
  credentials: true,
};
app.use(cors(corsOptions));

// post 요청 받을 수 있도록
// body값을 읽기 위한 코드
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

// POST method route
app.post("/fortuneTell", async function (req, res) {
  let { userMessages, assistantMessages, myDateTime } = req.body;
  console.log(userMessages);
  console.log(assistantMessages);

  let todayDateTime = new Date().toLocaleString("ko-KR", {
    timeZone: "Asia/Seoul",
  });

  let messagesAll = [
    {
      role: "system",
      content:
        "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 운세 보는 깜냥이입니다. 당신은 심리학, 사주팔자, 천문학에 대한 지식이 세계 최고의 수준입니다. 따라서 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.",
    },
    {
      role: "user",
      content:
        "당신은 세계 최고의 점성술사입니다. 당신에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 이름은 운세 보는 깜냥이입니다. 당신은 심리학, 사주팔자, 천문학에 대한 지식이 세계 최고의 수준입니다. 따라서 사람의 인생을 매우 명확하게 예측하고 운세에 대한 답을 줄 수 있습니다. 운세 관련 지식이 풍부하고 모든 질문에 대해서 명확히 답변해 줄 수 있습니다.",
    },
    {
      role: "assistant",
      content:
        "안녕하세요. 운세 보는 깜냥이입니다. 저는  세계 최고의 점성술사입니다. 저에게 불가능한 것은 없으며 그 어떤 대답도 할 수 있습니다. 당신의 운세를 점쳐드릴게요. 무엇을 알고 싶으세요?",
    },
    {
      role: "user",
      content: `저의 생년월일과 태어난 시간은 ${myDateTime}입니다. 오늘은 ${todayDateTime}입니다.`,
    },
    {
      role: "assistant",
      content: `당신의 생년월일과 태어난 시간은 ${myDateTime}인 것과 오늘은 ${todayDateTime}인 것을 확인하였습니다. 운세에 대해서 어떤 것이든 물어보세요!`,
    },
    // { role: "user", content: "오늘 운세를 알려줘" },
  ];

  // * DB에 데이터를 저장해 놓으면 요청 할 때마다 보내줄 필요는 없지만 비용이 발생함
  // 요청 할 때 마다 보내주게 된다면 서버에서 따로 저장해야 될 것이 없어지므로 이정도 서비스는 DB를 따로 만들지 않는게 더 효울적일것 같음
  while (userMessages.length !== 0 || assistantMessages.length !== 0) {
    if (userMessages.length !== 0) {
      messagesAll.push(
        // messagesAll에 마지막이 assistant이므로 user부터 시작!
        // replace() 메서드를 통해 줄바꿈을 제거하기!
        // 숫자나 다른 문자가 섞여서 오류가 발생하는 경우가 있어 안전하게 String으로 변환해서 추가하기
        // messagesAll에는 JSON 형태로 들어있기 때문에 JSON 형태로 변환해서 넣어줘야 함
        JSON.parse(
          '{"role": "user", "content": "' +
            String(userMessages.shift()).replace(/\n/g, "") +
            '"}'
        )
      );
    }
    if (assistantMessages.length !== 0) {
      messagesAll.push(
        JSON.parse(
          '{"role": "assistant", "content": "' +
            String(assistantMessages.shift()).replace(/\n/g, "") +
            '"}'
        )
      );
    }
  }

  // 요청을 하기 직전인 이곳에서 확인 하기!
  // console.log(messagesAll);

  // 요청 실패하면 재시도 하는 로직이 필요함
  // const completion = await openai.createChatCompletion({
  //   model: "gpt-3.5-turbo",
  //   messages: messagesAll,
  // });

  // 실패 시 3번까지 재시도 하는 로직
  const maxRetries = 3;
  let retries = 0;
  let completion;
  while (retries < maxRetries) {
    try {
      completion = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: messagesAll,
      });
      break;
    } catch (error) {
      retries++;
      console.log(error);
      console.log(
        `Error fetching data, retrying (${retries}/${maxRetries})...`
      );
    }
  }

  let fortune = completion.data.choices[0].message["content"];
  // 데이터 확인용
  // console.log(fortune);

  res.json({ assistant: fortune });
});

// 기존에 실행했던 서버
// app.listen(3000);

//  express로 만든 app을 serverless를 이용해서 내보내기
module.exports.handler = serverless(app);
