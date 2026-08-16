/*
    ========================================
    カテゴリー
    ========================================
*/

const category =
    localStorage.getItem(
        "selectedCategory"
    );


/*
    ========================================
    選択した級
    ========================================
*/

const selectedLevels =
    JSON.parse(
        localStorage.getItem(
            "selectedLevels"
        ) || "[]"
    );


/*
    ========================================
    問題数
    ========================================
*/

let requestedQuestionCount =
    Number(
        localStorage.getItem(
            "questionCount"
        )
    );


/*
    ========================================
    カテゴリー名
    ========================================
*/

const categoryNames = {

    vocab:
        "単語",

    idiom:
        "慣用句",

    expression:
        "慣用表現",

    proverb:
        "ことわざ",

    saja:
        "四字熟語"

};


/*
    ========================================
    JSONファイル
    ========================================
*/

const dataFiles = {

    vocab:
        "data/vocab.json",

    idiom:
        "data/idiom.json",

    expression:
        "data/expression.json",

    proverb:
        "data/proverb.json",

    saja:
        "data/saja.json"

};


/*
    ========================================
    カテゴリー確認
    ========================================
*/

if(
    !category ||
    !dataFiles[category]
){

    alert(
        "カテゴリー情報がありません。"
    );

    location.href =
        "index.html";

}


/*
    ========================================
    クイズカード取得
    ========================================
*/

function getQuizCard(){

    return (
        document.querySelector(".quiz-card")
        ||
        document.querySelector(".card")
    );

}


/*
    ========================================
    アニメーション
    ========================================
*/

function playAnimation(className){

    const card =
        getQuizCard();


    if(!card){

        return;

    }


    card.classList.remove(
        "quiz-correct-animation",
        "quiz-wrong-animation",
        "quiz-pop-animation"
    );


    /*
        同じアニメーションを
        連続して再生するための再描画
    */

    void card.offsetWidth;


    card.classList.add(
        className
    );

}


/*
    ========================================
    JSON読み込み
    ========================================
*/

async function loadQuestions(){

    try{

        const response =
            await fetch(
                dataFiles[category]
            );


        if(!response.ok){

            throw new Error(
                "JSONファイルを読み込めませんでした。"
            );

        }


        const allQuestions =
            await response.json();


        /*
            選択した級だけ取得
        */

        let questionPool =
            allQuestions.filter(
                question =>
                    selectedLevels.includes(
                        question.level
                    )
            );


        /*
            問題数チェック
        */

        if(
            !Number.isInteger(
                requestedQuestionCount
            ) ||
            requestedQuestionCount < 1
        ){

            requestedQuestionCount =
                1;

        }


        /*
            ランダム
        */

        shuffle(
            questionPool
        );


        /*
            問題数を制限
        */

        const totalQuestions =
            Math.min(
                requestedQuestionCount,
                questionPool.length
            );


        const questions =
            questionPool.slice(
                0,
                totalQuestions
            );


        /*
            問題がない場合
        */

        if(
            questions.length === 0
        ){

            alert(
                "選択した級の問題がありません。"
            );

            location.href =
                "index.html";

            return;

        }


        /*
            カテゴリー表示
        */

        const categoryTitle =
            document.getElementById(
                "categoryTitle"
            );


        if(categoryTitle){

            categoryTitle.textContent =
                categoryNames[category];

        }


        /*
            級表示
        */

        const levelText =
            selectedLevels
            .map(level => {

                if(
                    level === "pre2"
                ){

                    return "準2級";

                }

                return level + "級";

            })
            .join("・");


        const levelName =
            document.getElementById(
                "levelName"
            );


        if(levelName){

            levelName.textContent =
                "選択した級：" +
                levelText;

        }


        /*
            クイズ開始
        */

        startQuiz(
            questions
        );


    }catch(error){

        console.error(
            error
        );

        alert(
            "問題データの読み込みに失敗しました。"
        );

        location.href =
            "index.html";

    }

}


/*
    ========================================
    クイズ開始
    ========================================
*/

function startQuiz(questions){

    let currentIndex =
        0;


    let currentQuestion =
        questions[currentIndex];


    let answered =
        false;


    let correctCount =
        0;


    /*
        ====================================
        問題表示
        ====================================
    */

    function showQuestion(){

        currentQuestion =
            questions[currentIndex];


        /*
            問題
        */

        const question =
            document.getElementById(
                "question"
            );


        if(question){

            question.textContent =
                currentQuestion.japanese;

        }


        /*
            入力欄
        */

        const answer =
            document.getElementById(
                "answer"
            );


        if(answer){

            answer.value =
                "";

            answer.disabled =
                false;

        }


        /*
            結果
        */

        const result =
            document.getElementById(
                "result"
            );


        if(result){

            result.textContent =
                "";

            result.className =
                "result";

        }


        /*
            ヒント
        */

        const hint =
            document.getElementById(
                "hint"
            );


        if(hint){

            hint.textContent =
                "";

        }


        /*
            答え合わせボタン
        */

        const checkBtn =
            document.getElementById(
                "checkBtn"
            );


        if(checkBtn){

            checkBtn.style.display =
                "flex";

            checkBtn.disabled =
                false;

        }


        /*
            次の問題ボタン
        */

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );


        if(nextBtn){

            nextBtn.style.display =
                "none";

            nextBtn.disabled =
                false;

        }


        answered =
            false;


        /*
            問題表示アニメーション
        */

        playAnimation(
            "quiz-pop-animation"
        );


        /*
            フォーカス
        */

        if(answer){

            answer.focus();

        }

    }


    /*
        ====================================
        答え合わせ
        ====================================
    */

    window.checkAnswer = function(){

        /*
            すでに回答済みなら何もしない
        */

        if(answered){

            return;

        }


        const answer =
            document.getElementById(
                "answer"
            );


        if(!answer){

            return;

        }


        const userAnswer =
            answer.value.trim();


        /*
            空欄チェック
        */

        if(!userAnswer){

            alert(
                "答えを入力してください。"
            );

            answer.focus();

            return;

        }


        const result =
            document.getElementById(
                "result"
            );


        const isCorrect =
            userAnswer ===
            currentQuestion.korean;


        /*
            ================================
            正解
            ================================
        */

        if(isCorrect){

            correctCount++;


            if(result){

                result.className =
                    "result correct";

                result.innerHTML =
                    "⭕ 正解！";

            }


            /*
                正解アニメーション
            */

            playAnimation(
                "quiz-correct-animation"
            );

        }


        /*
            ================================
            不正解
            ================================
        */

        else{

            if(result){

                result.className =
                    "result wrong";

                result.innerHTML =
                    "❌ 不正解<br>" +
                    "正解：<b>" +
                    escapeHtml(
                        currentQuestion.korean
                    ) +
                    "</b>";

            }


            /*
                苦手問題へ保存
                既存なら連続正解をリセット
            */

            saveWrongWord();


            /*
                不正解アニメーション
            */

            playAnimation(
                "quiz-wrong-animation"
            );

        }


        /*
            履歴保存
        */

        saveHistory(
            isCorrect
        );


        /*
            回答済みにする
        */

        answered =
            true;


        /*
            入力欄を無効化
        */

        answer.disabled =
            true;


        /*
            答え合わせボタンを非表示
        */

        const checkBtn =
            document.getElementById(
                "checkBtn"
            );


        if(checkBtn){

            checkBtn.style.display =
                "none";

        }


        /*
            次の問題ボタンを表示
        */

        const nextBtn =
            document.getElementById(
                "nextBtn"
            );


        if(nextBtn){

            nextBtn.style.display =
                "flex";

            nextBtn.disabled =
                false;


            /*
                最後の問題なら
                ボタン名を変更
            */

            if(
                currentIndex + 1 >=
                questions.length
            ){

                nextBtn.textContent =
                    "結果を見る";

            }else{

                nextBtn.textContent =
                    "次の問題";

            }

        }

    };


    /*
        ====================================
        ヒント
        ====================================
    */

    window.showHint = function(){

        const hint =
            document.getElementById(
                "hint"
            );


        if(!hint){

            return;

        }


        if(currentQuestion.hint){

            hint.textContent =
                "ヒント：" +
                currentQuestion.hint;

        }else{

            hint.textContent =
                "ヒントはありません。";

        }

    };


    /*
        ====================================
        次の問題
        ====================================
    */

    window.nextQuestion = function(){

        /*
            回答していない場合は
            進ませない
        */

        if(!answered){

            return;

        }


        currentIndex++;


        /*
            最後まで終了
        */

        if(
            currentIndex >=
            questions.length
        ){

            showFinished();

            return;

        }


        /*
            次の問題
        */

        showQuestion();

    };


    /*
        ====================================
        終了画面
        ====================================
    */

    function showFinished(){

        const rate =
            Math.round(
                correctCount /
                questions.length *
                100
            );


        const card =
            getQuizCard();


        if(!card){

            return;

        }


        card.innerHTML = `

            <div class="finish">

                <div class="finish-icon">
                    🎉
                </div>

                <div class="finish-title">
                    学習終了！
                </div>

                <div class="finish-score">
                    ${rate}%
                </div>

                <div class="finish-stats">

                    <div class="finish-stat">

                        <div class="finish-stat-label">
                            問題数
                        </div>

                        <div class="finish-stat-value">
                            ${questions.length}問
                        </div>

                    </div>


                    <div class="finish-stat">

                        <div class="finish-stat-label">
                            正解数
                        </div>

                        <div class="finish-stat-value">
                            ${correctCount}問
                        </div>

                    </div>

                </div>


                <button
                    class="btn btn-primary"
                    onclick="retryQuiz()">

                    もう一度解く

                </button>


                <button
                    class="btn btn-secondary"
                    onclick="location.href='index.html'">

                    ホームへ戻る

                </button>

            </div>

        `;


        playAnimation(
            "quiz-pop-animation"
        );

    }


    /*
        ====================================
        もう一度解く
        ====================================
    */

    window.retryQuiz = function(){

        location.reload();

    };


    /*
        ====================================
        Enterキー
        ====================================
    */

    document.addEventListener(
        "keydown",
        function(event){

            /*
                Enter以外
            */

            if(
                event.key !==
                "Enter"
            ){

                return;

            }


            /*
                入力欄にフォーカスしている場合
                Enterで答え合わせ / 次へ
            */

            if(answered){

                window.nextQuestion();

            }else{

                window.checkAnswer();

            }

        }
    );


    /*
        最初の問題
    */

    showQuestion();

}


/*
    ========================================
    苦手問題保存
    ========================================
*/

function saveWrongWord(){

    let wrongWords =
        JSON.parse(
            localStorage.getItem(
                "wrongWords"
            ) || "[]"
        );


    /*
        現在の問題をIDで検索
    */

    const existingIndex =
        wrongWords.findIndex(
            word =>

                word.category ===
                category &&

                word.id ===
                currentQuestion.id
        );


    /*
        すでに存在する場合
        → 連続正解をリセット
    */

    if(existingIndex !== -1){

        wrongWords[
            existingIndex
        ].correctStreak =
            0;


        /*
            最新データに更新
        */

        wrongWords[
            existingIndex
        ].categoryName =
            categoryNames[category];


        wrongWords[
            existingIndex
        ].level =
            currentQuestion.level;


        wrongWords[
            existingIndex
        ].question =
            currentQuestion.japanese;


        wrongWords[
            existingIndex
        ].answer =
            currentQuestion.korean;


        wrongWords[
            existingIndex
        ].hint =
            currentQuestion.hint || "";

    }


    /*
        新しい問題の場合
    */

    else{

        wrongWords.push({

            category:
                category,

            categoryName:
                categoryNames[category],

            id:
                currentQuestion.id,

            level:
                currentQuestion.level,

            question:
                currentQuestion.japanese,

            answer:
                currentQuestion.korean,

            hint:
                currentQuestion.hint || "",

            correctStreak:
                0

        });

    }


    /*
        保存
    */

    localStorage.setItem(
        "wrongWords",
        JSON.stringify(
            wrongWords
        )
    );

}


/*
    ========================================
    学習履歴
    ========================================
*/

function saveHistory(isCorrect){

    let history =
        JSON.parse(
            localStorage.getItem(
                "studyHistory"
            ) || "[]"
        );


    history.push({

        category:
            category,

        categoryName:
            categoryNames[category],

        id:
            currentQuestion.id,

        level:
            currentQuestion.level,

        question:
            currentQuestion.japanese,

        answer:
            currentQuestion.korean,

        correct:
            isCorrect,

        date:
            new Date()
            .toLocaleString(
                "ja-JP"
            )

    });


    /*
        最新20件だけ保存
    */

    if(history.length > 20){

        history =
            history.slice(
                -20
            );

    }


    localStorage.setItem(
        "studyHistory",
        JSON.stringify(
            history
        )
    );

}


/*
    ========================================
    シャッフル
    ========================================
*/

function shuffle(array){

    for(
        let i =
            array.length - 1;

        i > 0;

        i--
    ){

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            array[i],
            array[j]
        ] =
        [
            array[j],
            array[i]
        ];

    }

}


/*
    ========================================
    HTMLエスケープ
    ========================================
*/

function escapeHtml(text){

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        text;


    return div.innerHTML;

}


/*
    ========================================
    読み込み開始
    ========================================
*/

loadQuestions();