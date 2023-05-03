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

let userMessages = []; // 사용자 메시지를 누적 저장할 배열
let assistantMessages = []; // 챗봇 메시지를 누적 저장할 배열
let myDateTime = "";

function loading() {
  document.getElementById("loader").style.display = "block";
  document.getElementById("btn").style.display = "none";
}

function start() {
  const date = document.getElementById("date").value;
  const hour = document.querySelector("#hour").value;
  if (date === "") {
    alert("생년월일을 입력해주세요.");
    return;
  }
  // if (hour === '') {
  //   alert('태어난 시간을 입력해주세요.');
  //   return;
  // }

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
    getFortune(message); // 입력된 메시지를 이용해 챗봇으로부터 운세를 받아옴
    inputBox.value = ""; // 입력 상자를 초기화
  }
}

// 챗봇에게 운세를 요청하는 함수
async function getFortune(message) {
  try {
    const response = await fetch("https://o3pxlz5mopgamqpu7xqa4i3roy0sopqw.lambda-url.ap-northeast-2.on.aws/fortune", {
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
    });
    const data = await response.json(); // 응답 데이터를 JSON 형식으로 변환
    // 응답이 왔을 때

    document.getElementById("loader").style.display = "none";
    document.getElementById("btn").style.display = "block";

    // assistantMessage 누적에 추가
    assistantMessages.push(data.assistant);

    addMessage(data.assistant); // 챗봇이 응답한 운세를 채팅 박스에 추가
    console.log(data); // 운세와 관련된 데이터를 콘솔에 출력
    return data; // 받은 데이터를 반환
  } catch (error) {
    // 오류 발생 시 콘솔에 출력
    console.log(error);
  }
}

document
  .querySelector(".chat-input button")
  .addEventListener("click", sendMessage);
