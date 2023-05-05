// 사용자 또는 챗봇의 메시지를 채팅 박스에 추가하는 함수
const chatBox = document.querySelector(".chat-box");
function addMessage(message, isUser = false) {
  // 채팅 박스 엘리먼트를 가져옴
  const p = document.createElement("p"); // 새로운 p 엘리먼트 생성
  p.innerText = message; // 메시지 내용을 p 엘리먼트의 텍스트로 설정
  if (isUser) {
    // isUser가 true면 사용자의 메시지, false면 챗봇의 메시지로 간주하여 클래스 추가
    p.classList.add("user");
  } else {
    p.classList.add("answer");
  }
  chatBox.appendChild(p); // 생성한 p 엘리먼트를 채팅 박스에 추가
  chatBox.scrollTop = chatBox.scrollHeight; // 채팅 박스를 스크롤하여 최신 메시지가 보이도록 함
}

const startInput = document.getElementById("chat-input");
let userMessages = []; // 사용자 메시지를 누적 저장할 배열
let assistantMessages = []; // 챗봇 메시지를 누적 저장할 배열
let myDateTime = "";

// 아이폰13에서 화면이 줌 된 상태로 운세 보기 버튼 클릭 시 결과 화면이 확대되어 사용자의 안좋은 경험을 유발하기 때문에 운세 보기 버튼 클릭 시 화면이 기본 스케일로 축소된 상태로 결과가 나옴
function zoomOut() {
  var viewport = document.querySelector("meta[name=viewport]");
  viewport.setAttribute(
    "content",
    "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0"
  );
  document.querySelector(".startBnt").blur();
}

// 복채주는 페이지로 이동하는
// function redirectToAbc() {
const elements = document.querySelectorAll(".gift");
elements.forEach((element) => {
  element.addEventListener("click", () => {
    window.location.href = "https://toss.me/limhada";
  });
});
// }

function start() {
  const date = document.getElementById("date1").value;
  const hour = document.querySelector("#hour").value;
  // console.log(date);
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (date === "") {
    alert("생년월일을 입력해주세요.");
    return;
  }
  if (!regex.test(date)) {
    alert("생년월일을 정확하게 입력해주세요.");
    return;
  }
  // 정확하지 않은 생년월일 입력하면 다시 생년월일 입력받기
  let warningOn = document.querySelector(".warning.on");
  if (warningOn) {
    alert("생년월일을 정확하게 입력해주세요!!.");
    return;
  }
  // if (hour === '') {
  //   alert('태어난 시간을 입력해주세요.');
  //   return;
  // }
  zoomOut();

  myDateTime = date + " " + hour;
  // 잘 입력되는지 확인용
  // console.log(myDateTime);

  // userMessages.push(date);
  // userMessages.push(hour);

  // document.getElementsByClassName("intro-container")[0].style.display = "none";
  // document.getElementsByClassName()는 HTMLCollection을 반환하므로, 단일 요소를 선택하려면 인덱스를 사용해야합니다.
  // document.querySelector(".intro-container").style = "display: none";
  // 위와 똑같은 기능
  document.querySelector(".intro-container").style.display = "none";
  document.querySelector(".chat-container").style.display = "block";
  // 위와 똑같은 기능

  startInput.value = "오늘 운세를 알려줘";
  sendMessage();
}

// 사용자가 메시지를 보내는 함수
function sendMessage() {
  const inputBox = document.querySelector(".chat-input input"); // 입력 상자 엘리먼트를 가져옴
  const message = inputBox.value.trim(); // 입력된 메시지를 가져와 공백 제거

  // 유저 누적에 메세지 추가
  userMessages.push(message);

  if (message) {
    // 입력된 메시지가 있으면
    addMessage(message, true); // 사용자의 메시지로 간주하여 채팅 박스에 추가
    getFortune(); // 입력된 메시지를 이용해 챗봇으로부터 운세를 받아옴
    inputBox.value = ""; // 입력 상자를 초기화

    loading();
  } else {
    // 입력된 메세지가 없으면
    alert("메시지를 입력해 주세요.");
    return;
  }
}

function loading() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("btn").style.display = "none";
}

function sleep(sec) {
  return new Promise((resolve) => setTimeout(resolve, sec * 1000));
}

function checked() {
  const t = document.createElement("p");
  t.innerText =
    "운세에 대해 더 궁금한 것이 있으면 질문해 주시고" +
    "<br>" +
    "우측 상단의 아이콘을 클릭해서 깜냥이에게 츄르를 후원해 주세요♡";
  t.classList.add("gift-check");
  chatBox.appendChild(t);
}

// 챗봇에게 운세를 요청하는 함수
async function getFortune() {
  const maxRetries = 3;
  let retries = 0;
  while (retries < maxRetries) {
    try {
      const response = await fetch(
        "https://p9vt8sq7sj.execute-api.ap-northeast-2.amazonaws.com/prod/fortuneTell",
        {
          // 운세를 요청할 서버 URL
          method: "POST", // POST 방식으로 요청
          headers: {
            "Content-Type": "application/json", // 요청의 content-type 설정
          },
          body: JSON.stringify({
            // FIXME: 지울거
            //   message: message,
            myDateTime: myDateTime,
            userMessages: userMessages,
            assistantMessages: assistantMessages,
          }), // 요청의 body에 입력된 메시지를 포함하여 전송
        }
      );
      const data = await response.json(); // 응답 데이터를 JSON 형식으로 변환
      // 응답이 왔을 때

      document.getElementById("loader").style.display = "none";
      document.getElementById("btn").style.display = "block";

      // assistantMessage 누적에 추가
      assistantMessages.push(data.assistant);

      addMessage(data.assistant); // 챗봇이 응답한 운세를 채팅 박스에 추가

      const ch = document.querySelector(".gift-check");
      if (ch === null) {
        checked();
      }

      // console.log(data); // 운세와 관련된 데이터를 콘솔에 출력
      return data; // 받은 데이터를 반환
    } catch (error) {
      // 오류 발생 시 콘솔에 출력
      await sleep(0.5);
      retries++;
      console.log(error);
      console.log(
        `Error fetching data, retrying (${retries}/${maxRetries})...`
      );
      if (retries === 3) {
        alert("서버가 불안정합니다. 잠시 후 다시 시도해주세요!");
      }
    }
  }
}

document
  .querySelector(".chat-input button")
  .addEventListener("click", sendMessage);

// 생년월일 입력 체크
let date1 = document.querySelector("#date1");
let warning = document.querySelector(".warning");

const onInputHandler = () => {
  let val = date1.value.replace(/\D/g, "");
  let leng = val.length;
  let result = "";

  if (leng < 6) result = val;
  else if (leng < 8) {
    result += val.substring(0, 4);
    result += "-";
    result += val.substring(4);
  } else {
    result += val.substring(0, 4);
    result += "-";
    result += val.substring(4, 6);
    result += "-";
    result += val.substring(6);

    if (!checkValidDate(result)) {
      warning.classList.add("on");
    } else {
      warning.classList.remove("on");
    }
  }
  date1.value = result;
};

const checkValidDate = (value) => {
  let result = true;
  try {
    let date = value.split("-");
    let y = parseInt(date[0], 10),
      m = parseInt(date[1], 10),
      d = parseInt(date[2], 10);

    let dateRegex =
      /^(?=\d)(?:(?:31(?!.(?:0?[2469]|11))|(?:30|29)(?!.0?2)|29(?=.0?2.(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00)))(?:\x20|$))|(?:2[0-8]|1\d|0?[1-9]))([-.\/])(?:1[012]|0?[1-9])\1(?:1[6-9]|[2-9]\d)?\d\d(?:(?=\x20\d)\x20|$))?(((0?[1-9]|1[012])(:[0-5]\d){0,2}(\x20[AP]M))|([01]\d|2[0-3])(:[0-5]\d){1,2})?$/;
    result = dateRegex.test(d + "-" + m + "-" + y);
  } catch (err) {
    result = false;
  }
  return result;
};
