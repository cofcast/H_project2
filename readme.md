# COFFEEFINDER BREW GUIDE

HTML, CSS, JavaScript만으로 만든 첫 번째 버전입니다. 설치·빌드 없이 실행하며, Supabase 클라이언트를 CDN으로 초기화합니다. 기존 화면은 샘플 데이터와 브라우저 임시 저장을 사용합니다.

## 실행

- `index.html`을 브라우저에서 열면 원두 목록을 볼 수 있습니다.
- 운영자 화면은 `admin.html`로 직접 접속합니다.
- 원두 고유 링크: `recipe.html?coffee=moonstone`
- Vercel에서는 프레임워크를 Other로 지정하고 빌드 명령 없이 프로젝트 루트를 배포하면 됩니다.
- 임시 저장을 여러 화면에서 일관되게 사용하려면 정적 호스팅 주소로 접속하세요. `file://` 직접 실행 시 브라우저에 따라 localStorage 공유가 제한될 수 있습니다.

## 수정할 파일

- `js/mock-data.js`: 샘플 원두명, 이미지 경로, HOT/ICE 레시피, 공개 여부
- `css/style.css`: 공통 화면 스타일과 모바일 대응
- `images/coffee/`: SVG 플레이스홀더. 실제 원두카드로 교체할 때 이 폴더에 파일을 넣고 이미지 경로를 수정합니다.
- `js/common.js`: 데이터 읽기·임시 저장·검증. 나중에 DB로 교체할 지점입니다.
- `js/supabase-client.js`: Supabase 프로젝트 URL, Publishable Key 및 클라이언트 초기화
- `js/home.js`, `js/recipe.js`, `js/timer.js`, `js/admin.js`: 각 화면의 동작

## Supabase 연결

모든 HTML에서 `https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2`를 로드한 다음 `js/supabase-client.js`를 실행합니다. 두 스크립트 모두 `defer`를 사용해 실행 순서를 유지합니다. [Supabase 공식 CDN 설치 안내](https://supabase.com/docs/reference/javascript/installing)를 따릅니다.

CDN 전역 `window.supabase`는 SDK로 유지하고, 생성한 클라이언트는 `window.supabaseClient`로 접근합니다. 브라우저 개발자 도구에서 `window.supabaseClient`로 초기화 여부를 확인할 수 있습니다. 클라이언트 생성만으로 서버 통신이나 테이블 접근 성공을 확인하는 것은 아닙니다.

제공된 Publishable Key만 사용하며 Secret Key는 사용하지 않습니다. 로그인은 구현하지 않았고 세션 저장, 자동 토큰 갱신, URL 인증 콜백 감지는 비활성화했습니다. 데이터 조회·저장은 아직 Supabase로 전환하지 않았으므로 기존 Mock Data와 localStorage가 유지됩니다.

CDN 로드에는 인터넷 연결이 필요합니다. SDK 로드 또는 초기화에 실패하면 `window.supabaseClient`는 `null`이며 콘솔에 경고를 표시하고 기존 로컬 기능은 계속 동작합니다.

## 레시피와 타이머

제공 수치는 동작 확인용 Mock Data이며 실제 판매용 레시피가 아닙니다. ICE의 총 물양은 얼음을 제외한 추출용 물양입니다.

각 단계의 `duration`은 **그 단계의 소요 시간(초)**, `water`는 **누적 목표 물양(g)**입니다. 마지막 단계의 물양은 레시피의 총 물양과 같아야 합니다. 관리 화면에서 단계 추가·삭제 및 수정을 할 수 있습니다.

레시피 화면 아래에 타이머가 준비된 상태로 표시됩니다. 추출 시작을 누르면 페이지 이동 없이 아래 타이머가 시작됩니다. HOT/ICE 전환 시 타이머도 해당 레시피로 초기화되며, 추출 진행 중에는 변경 여부를 확인합니다. 기존 timer.html 직접 링크도 계속 지원합니다. 타이머 URL에 직접 진입한 경우 `추출 시작`을 눌러 시작할 수 있습니다. 단계 변경 시 브라우저 Web Audio로 짧은 알림음을 생성합니다. 화면 이동 후 브라우저가 소리를 차단하는 경우 `알림음 켜기`를 한 번 눌러 주세요. 기기 음소거나 화면 잠금 상태에서는 소리가 나지 않을 수 있습니다. 화면을 다시 열면 경과 시간을 기준으로 현재 단계가 반영됩니다.

## 임시 저장

관리 화면 변경값은 이 브라우저의 `localStorage`에만 저장됩니다. 서버 저장·기기 간 동기화 기능은 없습니다. 새 원두는 기본 비공개이며 공개로 바꾸어 저장하면 홈과 고유 링크에서 접근할 수 있습니다. 비공개 원두는 홈과 직접 링크 모두에서 표시하지 않습니다.

저장값이 있으면 Mock Data보다 우선합니다. 초기 샘플로 되돌리려면 해당 사이트의 브라우저 저장 데이터를 지우세요. 인증 없는 MVP이므로 관리 화면은 개인 브라우저의 데이터만 바꾸며 운영 서버의 데이터는 변경하지 않습니다.
