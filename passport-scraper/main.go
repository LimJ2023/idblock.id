// passport-scraper/main.go
// PoC: Government24 여권 진위확인 페이지 자동화 스크래퍼 skeleton
//
// 사용법 (로컬 개발용):
//
//	$ go run . -name "홍길동" -no "M12345678" -issue 20230101 -expire 20330101 -birth 19900101
//
// 초기 버전은 Headless=false 로 두고 손으로 공동인증서 로그인을 완료한 뒤
// form 필드를 자동 입력/제출하는 실험을 목표로 한다.
// TODO: - 공동인증서 자동 로그인(korea-pki 라이브러리)
//   - CAPTCHA 대응(OCR)
//   - 정확한 selector 업데이트(정부24 UI 변경 시)
package main

import (
	"context"
	"encoding/json"
	"flag"
	"log"
	"os"
	"strings"
	"time"

	"github.com/chromedp/chromedp"
)

type PassportInput struct {
	UserName   string
	PassportNo string
	IssueDate  string
	ExpireDate string
	BirthDate  string
}

type Result struct {
	Match bool   `json:"match"`
	Raw   string `json:"raw_html"`
}

func main() {
	var userName = flag.String("name", "", "한글 성명")
	var passportNo = flag.String("no", "", "여권번호")
	var issueDate = flag.String("issue", "", "발급일 YYYYMMDD")
	var expireDate = flag.String("expire", "", "만료일 YYYYMMDD")
	var birthDate = flag.String("birth", "", "생년월일 YYYYMMDD")
	var headless = flag.Bool("headless", false, "Headless 모드 사용 여부")
	flag.Parse()

	if *userName == "" || *passportNo == "" {
		log.Fatalln("--name 과 --no 는 필수입니다")
	}

	input := PassportInput{*userName, *passportNo, *issueDate, *expireDate, *birthDate}

	// Chrome 실행 옵션
	ctx, cancel := chromedp.NewExecAllocator(context.Background(),
		append(chromedp.DefaultExecAllocatorOptions[:],
			chromedp.Flag("headless", *headless),
			chromedp.Flag("disable-gpu", true),
			chromedp.Flag("no-sandbox", true),
		)...,
	)
	defer cancel()

	ctx, cancel = chromedp.NewContext(ctx)
	defer cancel()

	ctx, cancel = context.WithTimeout(ctx, 90*time.Second)
	defer cancel()

	var html string
	if err := chromedp.Run(ctx, bookingFlow(input, &html)); err != nil {
		log.Fatalf("chromedp error: %v", err)
	}

	match := parseResult(html)
	out := Result{Match: match, Raw: html}
	_ = json.NewEncoder(os.Stdout).Encode(out)
}

func bookingFlow(p PassportInput, html *string) chromedp.Tasks {
	const url = "https://www.gov.kr/portal/passport/passportAuth" // TODO: 실제 URL 확인
	return chromedp.Tasks{
		chromedp.Navigate(url),
		chromedp.WaitVisible(`#passportAuthForm`, chromedp.ByID),
		// TODO: 공동인증서 처리 전까지 수동 로그인 후 사용
		chromedp.SetValue(`#pname`, p.UserName, chromedp.ByID),
		chromedp.SetValue(`#passportNo`, p.PassportNo, chromedp.ByID),
		chromedp.SetValue(`#issueDate`, p.IssueDate, chromedp.ByID),
		chromedp.SetValue(`#expireDate`, p.ExpireDate, chromedp.ByID),
		chromedp.SetValue(`#birthDate`, p.BirthDate, chromedp.ByID),
		chromedp.Click(`#btnSubmit`, chromedp.NodeVisible),
		chromedp.Sleep(3 * time.Second),
		chromedp.OuterHTML("html", html, chromedp.ByQuery),
	}
}

func parseResult(html string) bool {
	html = strings.ReplaceAll(html, " ", "")
	return strings.Contains(html, "진위여부:일치")
}
