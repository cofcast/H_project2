// 샘플 레시피입니다. 실제 판매용 수치는 운영자가 확인한 뒤 교체하세요.
// duration: 단계 소요 시간(초), water: 해당 단계의 누적 물양(g)
const MOCK_COFFEES = [
  {
    id: 'moonstone', name: '문스톤', image: 'images/coffee/moonstonecard.svg', published: true,
    hot: {
      dose: 20, temperature: 93, water: 300, c40: '24 클릭', ek43: '8.5',
      steps: [
        { title: '뜸 들이기', instruction: '원두를 고르게 적시고 기다려 주세요.', duration: 30, water: 40 },
        { title: '1차 물 붓기', instruction: '중앙에서 바깥으로 천천히 물을 부어 주세요.', duration: 40, water: 150 },
        { title: '2차 물 붓기', instruction: '목표 물양까지 부드럽게 물을 부어 주세요.', duration: 40, water: 300 },
        { title: '추출 기다리기', instruction: '물을 더 붓지 않고 커피가 내려오기를 기다려 주세요.', duration: 70, water: 300 }
      ]
    },
    ice: {
      dose: 22, temperature: 92, water: 180, c40: '22 클릭', ek43: '8.0',
      steps: [
        { title: '뜸 들이기', instruction: '원두를 고르게 적시고 기다려 주세요.', duration: 30, water: 40 },
        { title: '1차 물 붓기', instruction: '원을 그리며 천천히 물을 부어 주세요.', duration: 35, water: 100 },
        { title: '2차 물 붓기', instruction: '목표 물양까지 물을 부어 주세요.', duration: 35, water: 180 },
        { title: '추출 기다리기', instruction: '커피가 내려오면 얼음이 담긴 잔에 옮겨 주세요.', duration: 50, water: 180 }
      ]
    }
  },
  {
    id: 'daylight', name: '데이라이트', image: 'images/coffee/daylight.svg', published: true,
    hot: {
      dose: 18, temperature: 94, water: 270, c40: '25 클릭', ek43: '9.0',
      steps: [
        { title: '뜸 들이기', instruction: '원두 전체를 적시고 기다려 주세요.', duration: 35, water: 40 },
        { title: '1차 물 붓기', instruction: '일정한 속도로 천천히 물을 부어 주세요.', duration: 40, water: 140 },
        { title: '2차 물 붓기', instruction: '목표 물양까지 물을 부어 주세요.', duration: 40, water: 270 },
        { title: '추출 기다리기', instruction: '커피가 모두 내려오기를 기다려 주세요.', duration: 65, water: 270 }
      ]
    },
    ice: {
      dose: 20, temperature: 91, water: 160, c40: '23 클릭', ek43: '8.5',
      steps: [
        { title: '뜸 들이기', instruction: '원두 전체를 적시고 기다려 주세요.', duration: 30, water: 40 },
        { title: '1차 물 붓기', instruction: '일정한 속도로 천천히 물을 부어 주세요.', duration: 35, water: 100 },
        { title: '2차 물 붓기', instruction: '목표 물양까지 물을 부어 주세요.', duration: 35, water: 160 },
        { title: '추출 기다리기', instruction: '커피가 내려오면 얼음이 담긴 잔에 옮겨 주세요.', duration: 50, water: 160 }
      ]
    }
  }
];
