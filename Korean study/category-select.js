/*
    カテゴリー取得
*/

const category =
    localStorage.getItem(
        "selectedCategory"
    );


/*
    カテゴリー情報
*/

const categoryInfo = {

    vocab: {
        name: "単語",
        icon: "📚"
    },

    idiom: {
        name: "慣用句",
        icon: "💬"
    },

    expression: {
        name: "慣用表現",
        icon: "🗣️"
    },

    proverb: {
        name: "ことわざ",
        icon: "📖"
    },

    saja: {
        name: "四字熟語",
        icon: "🀄"
    }

};


/*
    カテゴリー確認
*/

if(
    !category ||
    !categoryInfo[category]
){

    alert(
        "カテゴリー情報がありません。"
    );

    location.href =
        "index.html";

}


/*
    カテゴリー表示
*/

const info =
    categoryInfo[category];


document.getElementById(
    "categoryTitle"
).textContent =
    info.name;


document.getElementById(
    "categoryIcon"
).textContent =
    info.icon;


/*
    選択された級
*/

let selectedLevels = [];


/*
    級ボタン
*/

const levelButtons =
    document.querySelectorAll(
        ".level-card"
    );


levelButtons.forEach(button => {

    button.addEventListener(
        "click",
        function(){

            const level =
                this.dataset.level;


            if(
                selectedLevels.includes(
                    level
                )
            ){

                /*
                    選択解除
                */

                selectedLevels =
                    selectedLevels.filter(
                        item =>
                            item !== level
                    );


                this.classList.remove(
                    "selected"
                );

            }else{

                /*
                    選択
                */

                selectedLevels.push(
                    level
                );


                this.classList.add(
                    "selected"
                );

            }


            updateStartButton();

        }
    );

});


/*
    問題数
*/

const questionCount =
    document.getElementById(
        "questionCount"
    );


/*
    開始ボタン状態更新
*/

function updateStartButton(){

    const startButton =
        document.getElementById(
            "startButton"
        );


    const count =
        Number(
            questionCount.value
        );


    if(
        selectedLevels.length > 0 &&
        Number.isInteger(count) &&
        count >= 1
    ){

        startButton.disabled =
            false;

        startButton.textContent =
            `${count}問で学習を開始`;

    }else{

        startButton.disabled =
            true;

        startButton.textContent =
            "学習を開始する";

    }

}


/*
    問題数変更
*/

questionCount.addEventListener(
    "input",
    updateStartButton
);


/*
    学習開始
*/

document.getElementById(
    "startButton"
).addEventListener(
    "click",
    function(){

        const count =
            Number(
                questionCount.value
            );


        if(
            selectedLevels.length === 0
        ){

            alert(
                "級を1つ以上選択してください。"
            );

            return;

        }


        if(
            !Number.isInteger(count) ||
            count < 1
        ){

            alert(
                "問題数を1問以上にしてください。"
            );

            return;

        }


        /*
            localStorage保存
        */

        localStorage.setItem(
            "selectedLevels",
            JSON.stringify(
                selectedLevels
            )
        );


        localStorage.setItem(
            "questionCount",
            count
        );


        /*
            クイズ画面へ
        */

        location.href =
            "category-quiz.html";

    }
);