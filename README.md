<img src="https://capsule-render.vercel.app/api?type=waving&color=auto&height=250&section=header&text=Face2Pepe&fontSize=90" />

## 📆 제작 기간  
2026년 01월 21일 - 2026년 01월 23일

---

## 📌 개요  
**Face2Pepe**는 웹캠 입력을 기반으로 얼굴/손 랜드마크를 추적하고, 상태 태그 조합에 따라 페페 짤을 즉시 매칭하는 실시간 인터랙티브 프로젝트입니다.  
MediaPipe Face Mesh/Hands에서 얻은 랜드마크로 **입/눈/고개/팔/손 상태를 인식**하고, 이를 **태그 기반 룰셋**으로 정규화해 예측 지연 없이 반응하도록 설계했습니다.

---

## ✅ 테스트 링크  
- https://face2pepe.web.app/

---

## 🛠️ 기술 스택  

### 📱 Frontend
![html](https://img.shields.io/badge/HTML5-000000?style=for-the-badge&logo=html5&logoColor=white)
![css](https://img.shields.io/badge/CSS3-000000?style=for-the-badge&logo=css3&logoColor=white)
![javascript](https://img.shields.io/badge/JavaScript-000000?style=for-the-badge&logo=javascript&logoColor=white)

### 🤖 CV / Tracking
![mediapipe](https://img.shields.io/badge/MediaPipe-000000?style=for-the-badge&logo=google&logoColor=white)

### ☁️ Hosting
![firebase](https://img.shields.io/badge/Firebase-000000?style=for-the-badge&logo=firebase&logoColor=white)

---

## ✨ 주요 기능  
- MediaPipe Face Mesh/Hands 기반 랜드마크 추적
- 입/눈/고개/팔/손 상태를 임계값 기반으로 정규화
- 태그 조합 매칭으로 즉시 이미지 스위칭
- 상태 디버그 패널(입/눈/고개/팔/손) 실시간 표시
- 전 처리 과정 클라이언트 사이드 실행

---

## 🧠 ML이 아닌 매핑 방식을 채택한 이유
- **지연 없는 즉시 반응**: 모델 추론 없이 룰 기반 태깅으로 프레임 단위 반응성을 확보했습니다.
- **디버깅 가능성**: 상태/태그를 사람이 해석 가능한 형태로 노출해 원인 분석과 튜닝이 쉽습니다.
- **튜닝 비용 절감**: 임계값과 태그만 조정하면 시나리오 변경을 즉시 반영할 수 있습니다.
- **데이터 준비 불필요**: 학습 데이터 수집/라벨링 없이도 목적 동작을 구현할 수 있습니다.

---

## 📂 폴더 구조

```
📦
├── assets
│   └── pepe                 # 로컬 페페 이미지
├── public
│   ├── assets
│   │   └── pepe              # 배포용 이미지
│   ├── index.html
│   ├── styles.css
│   ├── main.js
│   ├── face.js
│   ├── hands.js
│   ├── emotionRules.js
│   ├── memeMatcher.js
│   └── pepe.json
├── firebase.json
└── README.md
```

---

## 🙋‍♂️ 제작자  
- 이름: Leeyunseok
- 역할: Frontend Developer (1인 개발)
- GitHub: [@leeyunseokarchive](https://github.com/leeyunseokarchive)
- Instagram: [@oskueny](https://www.instagram.com/oskueny/)
- 문의: dbstjr3576@gmail.com
