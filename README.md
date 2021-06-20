# link-collector

## 실행
```
npm install
npm run start:dev
```

## 환경설정
.env 파일 사용
```
ELASTICSEARCH_HOST=192.168.50.7:9200
ELASTICSEARCH_INDEX=link
MONGODB_URI=mongodb://192.168.50.7:27017/link-collector
REDIS_URL=redis://192.168.50.7
```

## 사용법
### 크롤링 요청
```
# curl -d '{"url": "https://apple.co/3cG3FiD"}' -H "Content-Type: application/json" "http://localhost:3000/api/v1/link"
```
```json
{
  "response": true
}
```

### 목록 요청
```
curl "http://localhost:3000/api/v1/link"
```

### 특정 링크 정보 조회
```
curl "http://localhost:3000/api/v1/link?url=https://apple.co/3cG3FiD"
```

```json
{
  "response": {
    "links": [
      {
        "category": [],
        "_id": "60ced8b8997d2d2bda74d65e",
        "url": "https://developer.apple.com/videos/play/wwdc2021/10030/",
        "title": "Develop advanced web content - WWDC 2021 - Videos - Apple Developer",
        "hostname": "developer.apple.com",
        "alias": [
          {
            "_id": "60ced8b8997d2d2bda74d65f",
            "url": "https://apple.co/3cG3FiD"
          },
          {
            "_id": "60ced8b8997d2d2bda74d660",
            "url": "https://developer.apple.com/videos/play/wwdc2021/10030/"
          }
        ],
        "search_index_id": "OIv-J3oBeROXH1H7j4yf",
        "thumbnail": "https://devimages-cdn.apple.com/wwdc-services/images/119/4918/4918_wide_250x141_2x.jpg",
        "description": "Develop in JavaScript, WebGL, or WebAssembly? Learn how the latest updates to Safari and WebKit — including language changes to class...",
        "inserted_at": "2021-06-20T05:57:09.909Z",
        "__v": 0
      }
    ]
  }
}
```

### 특정 링크 아이디로 정보 조회
```
curl "http://localhost:3000/api/v1/link/60ced8b8997d2d2bda74d65e"
```

```json
{
  "response": {
    "links": [
      {
        "category": [],
        "_id": "60ced8b8997d2d2bda74d65e",
        "url": "https://developer.apple.com/videos/play/wwdc2021/10030/",
        "title": "Develop advanced web content - WWDC 2021 - Videos - Apple Developer",
        "hostname": "developer.apple.com",
        "alias": [
          {
            "_id": "60ced8b8997d2d2bda74d65f",
            "url": "https://apple.co/3cG3FiD"
          },
          {
            "_id": "60ced8b8997d2d2bda74d660",
            "url": "https://developer.apple.com/videos/play/wwdc2021/10030/"
          }
        ],
        "search_index_id": "OIv-J3oBeROXH1H7j4yf",
        "thumbnail": "https://devimages-cdn.apple.com/wwdc-services/images/119/4918/4918_wide_250x141_2x.jpg",
        "description": "Develop in JavaScript, WebGL, or WebAssembly? Learn how the latest updates to Safari and WebKit — including language changes to class...",
        "inserted_at": "2021-06-20T05:57:09.909Z",
        "__v": 0
      }
    ]
  }
}
```

### 링크 삭제
```
curl -X DELETE -d '{"url": "https://apple.co/3cG3FiD"}' -H "Content-Type: application/json" "http://localhost:3000/api/v1/link"
```
