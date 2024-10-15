const API_URL = 'https://www.work24.go.kr/cm/openApi/call/wk/callOpenApiSvcInfo210L01.do';
const API_KEY = 'e40097e2-7560-4ead-8bae-8f1c4e17d46f'; // 인증키

const loading = document.getElementById('loading');
const error = document.getElementById('error');
const jobList = document.getElementById('jobList');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const regionFilter = document.getElementById('regionFilter'); // 지역 필터링 요소

let currentPage = 1;  // 현재 페이지
const displayCount = 10;  // 한 페이지에 표시할 항목 수
let filteredJobs = [];  // 필터링된 작업 목록

async function fetchJobs() {
    loading.style.display = 'block';
    error.style.display = 'none';
    jobList.innerHTML = '';

    const selectedRegion = regionFilter.value; // 선택된 지역
    // 요청 URL 생성
    const url = `${API_URL}?authKey=${API_KEY}&callTp=L&returnType=XML&startPage=${currentPage}&display=100`; // 최대 100개 요청

    try {
        const response = await fetch(url);
        const textData = await response.text();  // XML 응답을 텍스트로 받음
        console.log("응답 데이터:", textData);  // XML 응답 내용을 확인
        
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(textData, "application/xml");

        // 응답의 에러 여부 확인
        const messageElement = xmlDoc.getElementsByTagName("message")[0];
        const messageCdElement = xmlDoc.getElementsByTagName("messageCd")[0];

        if (messageElement) {
            const message = messageElement.textContent;
            const messageCd = messageCdElement ? messageCdElement.textContent : "코드를 찾을 수 없습니다.";
            throw new Error(`오류 메시지: ${message} (코드: ${messageCd})`);
        }

        const jobs = xmlDoc.getElementsByTagName("wanted");

        if (jobs.length === 0) {
            throw new Error("채용 정보가 없습니다.");
        }

        // 선택된 지역으로 필터링
        filteredJobs = Array.from(jobs).filter(job => {
            const region = job.getElementsByTagName("region")[0]?.textContent || '';
            return selectedRegion === '' || region.includes(selectedRegion); // 전체 또는 선택된 지역에 포함
        });

        // 페이지네이션 처리
        renderJobs();
        
    } catch (err) {
        console.error('Error:', err);
        error.textContent = '채용 정보를 불러오는 데 실패했습니다: ' + err.message;
        error.style.display = 'block';
    } finally {
        loading.style.display = 'none';
    }
}

function renderJobs() {
    jobList.innerHTML = '';
    const start = (currentPage - 1) * displayCount;
    const end = start + displayCount;
    const jobsToDisplay = filteredJobs.slice(start, end);  // 현재 페이지에 해당하는 작업

    if (jobsToDisplay.length === 0) {
        error.textContent = '해당 조건에 맞는 채용 정보가 없습니다.';
        error.style.display = 'block';
        return;
    }

    jobsToDisplay.forEach(job => {
        const li = document.createElement('li');
        const company = job.getElementsByTagName("company")[0]?.textContent || '정보 없음';
        const infoUrl = job.getElementsByTagName("wantedInfoUrl")[0]?.textContent || '#'; // 상세 URL 가져오기

        li.innerHTML = `
            <h2><a href="${infoUrl}" target="_blank">${company}</a></h2>
            <p>${job.getElementsByTagName("title")[0]?.textContent || '정보 없음'}</p>
            <p>지역: ${job.getElementsByTagName("region")[0]?.textContent || '정보 없음'}</p>
            <p>급여: ${job.getElementsByTagName("sal")[0]?.textContent || '정보 없음'}</p>
            <p>고용형태: ${job.getElementsByTagName("holidayTpNm")[0]?.textContent || '정보 없음'}</p>
        `;
        jobList.appendChild(li);
    });

    // 페이지 버튼 활성화
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = end >= filteredJobs.length;  // 다음 페이지가 없으면 비활성화
}

// 이전 페이지 버튼 클릭 처리
prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderJobs();  // 작업 목록 다시 렌더링
        window.scrollTo(0, 0); // 페이지 상단으로 스크롤
    }
});

// 다음 페이지 버튼 클릭 처리
nextPageBtn.addEventListener('click', () => {
    if ((currentPage * displayCount) < filteredJobs.length) {
        currentPage++;
        renderJobs();  // 작업 목록 다시 렌더링
        window.scrollTo(0, 0); // 페이지 상단으로 스크롤
    }
});

// 지역 필터링 변경 시 작업 목록 새로고침
regionFilter.addEventListener('change', () => {
    currentPage = 1;  // 페이지를 첫 페이지로 리셋
    fetchJobs();  // 작업 목록 새로 고침
});

// 초기 호출
fetchJobs();
