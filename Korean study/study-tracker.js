/*
    ========================================
    Korean Study
    学習記録・目標・連続学習・
    単語学習進捗・学習グループ 共通処理
========================================
*/


const STUDY_GOAL_KEY =
    "studyGoal";

const STUDY_DAYS_KEY =
    "studyDays";

const STUDY_HISTORY_KEY =
    "studyHistory";


/*
    ========================================
    単語学習進捗

    category
        └ level
            └ id
                └ correctCount
========================================
*/

const WORD_PROGRESS_KEY =
    "wordStudyProgress";


/*
    ========================================
    学習グループ

    現在学習中のグループを保存する。

    category
    levels
    questionCount
    words
========================================
*/

const STUDY_GROUP_KEY =
    "studyGroup";


/*
    ========================================
    日付
========================================
*/

function getDateKey(date = new Date()){

    const year =
        date.getFullYear();

    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, "0");

    const day =
        String(
            date.getDate()
        ).padStart(2, "0");

    return `${year}-${month}-${day}`;

}


/*
    ========================================
    日付に日数を加算
========================================
*/

function addDays(date, days){

    const result =
        new Date(date);

    result.setDate(
        result.getDate() + days
    );

    return result;

}


/*
    ========================================
    目標期間情報
========================================
*/

function getPeriodLabel(days){

    if(days >= 2 && days <= 6){

        return `${days}日間`;

    }

    if(days === 7){

        return "1週間";

    }

    if(days === 14){

        return "2週間";

    }

    if(days === 21){

        return "3週間";

    }

    if(days === 30){

        return "1か月";

    }

    return `${days}日間`;

}


/*
    ========================================
    目標を取得
========================================
*/

function getStudyGoal(){

    const saved =
        localStorage.getItem(
            STUDY_GOAL_KEY
        );

    if(!saved){

        return null;

    }

    try{

        return JSON.parse(
            saved
        );

    }catch(error){

        return null;

    }

}


/*
    ========================================
    目標を保存
========================================
*/

function saveStudyGoal(
    periodDays,
    targetQuestions
){

    const startDate =
        new Date();

    startDate.setHours(
        0,0,0,0
    );

    const endDate =
        addDays(
            startDate,
            periodDays
        );

    const goal = {

        periodDays:
            periodDays,

        targetQuestions:
            targetQuestions,

        startTimestamp:
            startDate.getTime(),

        endTimestamp:
            endDate.getTime(),

        periodLabel:
            getPeriodLabel(
                periodDays
            )

    };

    localStorage.setItem(
        STUDY_GOAL_KEY,
        JSON.stringify(
            goal
        )
    );

    return goal;

}


/*
    ========================================
    履歴取得
========================================
*/

function getStudyHistory(){

    try{

        return JSON.parse(
            localStorage.getItem(
                STUDY_HISTORY_KEY
            ) || "[]"
        );

    }catch(error){

        return [];

    }

}


/*
    ========================================
    学習履歴保存
========================================
*/

function saveStudyResult({

    category,
    categoryName,
    id,
    level,
    question,
    answer,
    correct,
    resultType = "correct"

}){

    let history =
        getStudyHistory();

    history.push({

        category:
            category || "",

        categoryName:
            categoryName || "",

        id:
            id ?? null,

        level:
            level || "",

        question:
            question || "",

        answer:
            answer || "",

        correct:
            correct === true,

        resultType:
            resultType,

        date:
            new Date()
                .toLocaleString(
                    "ja-JP"
                ),

        timestamp:
            Date.now()

    });


    /*
        最新20件だけ保存
    */

    if(history.length > 20){

        history =
            history.slice(-20);

    }

    localStorage.setItem(
        STUDY_HISTORY_KEY,
        JSON.stringify(
            history
        )
    );

    recordStudyDay();

}


/*
    ========================================
    学習した日を記録
========================================
*/

function recordStudyDay(){

    let days = [];

    try{

        days =
            JSON.parse(
                localStorage.getItem(
                    STUDY_DAYS_KEY
                ) || "[]"
            );

    }catch(error){

        days = [];

    }

    const today =
        getDateKey();

    if(
        !days.includes(
            today
        )
    ){

        days.push(
            today
        );

    }

    days =
        days.slice(-365);

    localStorage.setItem(
        STUDY_DAYS_KEY,
        JSON.stringify(
            days
        )
    );

}


/*
    ========================================
    連続学習日数
========================================
*/

function getStudyStreak(){

    let days = [];

    try{

        days =
            JSON.parse(
                localStorage.getItem(
                    STUDY_DAYS_KEY
                ) || "[]"
            );

    }catch(error){

        return 0;

    }

    if(days.length === 0){

        return 0;

    }

    const daySet =
        new Set(days);

    const today =
        new Date();

    today.setHours(
        0,0,0,0
    );

    let cursor =
        today;

    const todayKey =
        getDateKey(
            cursor
        );

    if(
        !daySet.has(
            todayKey
        )
    ){

        cursor =
            addDays(
                cursor,
                -1
            );

    }

    let streak = 0;

    while(true){

        const key =
            getDateKey(
                cursor
            );

        if(
            !daySet.has(
                key
            )
        ){

            break;

        }

        streak++;

        cursor =
            addDays(
                cursor,
                -1
            );

    }

    return streak;

}


/*
    ========================================
    履歴のtimestamp
========================================
*/

function getHistoryTimestamp(item){

    if(
        typeof item.timestamp ===
        "number"
    ){

        return item.timestamp;

    }

    if(item.date){

        const parsed =
            Date.parse(
                item.date
            );

        if(!Number.isNaN(parsed)){

            return parsed;

        }

    }

    return 0;

}


/*
    ========================================
    現在の目標進捗
========================================
*/

function getStudyGoalProgress(){

    const goal =
        getStudyGoal();

    if(!goal){

        return null;

    }

    const now =
        Date.now();

    const history =
        getStudyHistory();

    const count =
        history.filter(
            item => {

                const timestamp =
                    getHistoryTimestamp(
                        item
                    );

                return (
                    timestamp >=
                    goal.startTimestamp &&

                    timestamp <
                    goal.endTimestamp
                );

            }
        ).length;

    const remaining =
        Math.max(
            goal.targetQuestions -
            count,
            0
        );

    const progress =
        Math.min(
            Math.round(
                count /
                goal.targetQuestions *
                100
            ),
            100
        );

    return {

        goal:
            goal,

        count:
            count,

        remaining:
            remaining,

        progress:
            progress,

        active:
            now <
            goal.endTimestamp,

        finished:
            now >=
            goal.endTimestamp

    };

}


/*
    ========================================
    目標期間の残り日数
========================================
*/

function getRemainingGoalDays(){

    const goal =
        getStudyGoal();

    if(!goal){

        return 0;

    }

    const now =
        new Date();

    now.setHours(
        0,0,0,0
    );

    const end =
        new Date(
            goal.endTimestamp
        );

    end.setHours(
        0,0,0,0
    );

    const diff =
        end.getTime() -
        now.getTime();

    return Math.max(
        Math.ceil(
            diff /
            (1000 * 60 * 60 * 24)
        ),
        0
    );

}


/*
    ========================================
    単語学習進捗
========================================
*/

function getWordStudyProgress(){

    try{

        return JSON.parse(
            localStorage.getItem(
                WORD_PROGRESS_KEY
            ) || "{}"
        );

    }catch(error){

        return {};

    }

}


/*
    ========================================
    単語進捗を保存
========================================
*/

function saveWordStudyProgress(
    progress
){

    localStorage.setItem(
        WORD_PROGRESS_KEY,
        JSON.stringify(
            progress
        )
    );

}


/*
    ========================================
    カテゴリー・級・単語IDのキー
========================================
*/

function getWordProgressKey(
    category,
    level,
    id
){

    return (
        `${category}__${level}__${id}`
    );

}


/*
    ========================================
    単語の現在の正解回数
========================================
*/

function getWordCorrectCount({

    category,
    level,
    id

}){

    const progress =
        getWordStudyProgress();

    const key =
        getWordProgressKey(
            category,
            level,
            id
        );

    const item =
        progress[key];

    if(!item){

        return 0;

    }

    return Number(
        item.correctCount || 0
    );

}


/*
    ========================================
    単語の正解回数を1増やす
========================================
*/

function addWordCorrect({

    category,
    level,
    id

}){

    const progress =
        getWordStudyProgress();

    const key =
        getWordProgressKey(
            category,
            level,
            id
        );

    if(!progress[key]){

        progress[key] = {

            category:
                category,

            level:
                level,

            id:
                id,

            correctCount:
                0

        };

    }

    progress[key].correctCount =
        Number(
            progress[key].correctCount || 0
        ) + 1;


    if(
        progress[key].correctCount > 3
    ){

        progress[key].correctCount =
            3;

    }

    saveWordStudyProgress(
        progress
    );

    return progress[key].correctCount;

}


/*
    ========================================
    学習済みか
========================================
*/

function isWordLearned({

    category,
    level,
    id

}){

    return (
        getWordCorrectCount({

            category,
            level,
            id

        }) >= 3
    );

}


/*
    ========================================
    配列シャッフル
========================================
*/

function shuffleStudyArray(array){

    const result =
        [...array];

    for(
        let i =
            result.length - 1;

        i > 0;

        i--
    ){

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );

        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }

    return result;

}


/*
    ========================================
    学習グループ取得
========================================
*/

function getStudyGroup(){

    try{

        return JSON.parse(
            localStorage.getItem(
                STUDY_GROUP_KEY
            ) || "null"
        );

    }catch(error){

        return null;

    }

}


/*
    ========================================
    学習グループ保存
========================================
*/

function saveStudyGroup(
    group
){

    localStorage.setItem(
        STUDY_GROUP_KEY,
        JSON.stringify(
            group
        )
    );

}


/*
    ========================================
    学習グループ削除
========================================
*/

function clearStudyGroup(){

    localStorage.removeItem(
        STUDY_GROUP_KEY
    );

}


/*
    ========================================
    問題数を安全に取得
========================================
*/

function normalizeQuestionCount(
    questionCount
){

    const count =
        Number(
            questionCount
        );

    if(
        !Number.isInteger(count) ||
        count < 1
    ){

        return 1;

    }

    return count;

}


/*
    ========================================
    現在の設定と
    保存されているグループが
    同じか確認
========================================
*/

function isSameStudyGroupSetting({

    group,
    category,
    levels,
    questionCount

}){

    if(!group){

        return false;

    }

    if(
        group.category !==
        category
    ){

        return false;

    }


    /*
        ★重要

        問題数が変わったら
        別グループとして扱う。

        例：

        2問
        ↓
        10問

        現在のグループを終了して
        10問の新しいグループを作る。
    */

    if(
        Number(
            group.questionCount
        ) !==
        normalizeQuestionCount(
            questionCount
        )
    ){

        return false;

    }


    if(
        !Array.isArray(
            group.levels
        )
    ){

        return false;

    }

    const a =
        [...group.levels]
            .sort();

    const b =
        [...levels]
            .sort();

    if(
        a.length !==
        b.length
    ){

        return false;

    }

    return a.every(
        (
            value,
            index
        ) =>
            value ===
            b[index]
    );

}


/*
    ========================================
    現在のグループが
    全部3回正解済みか
========================================
*/

function isStudyGroupComplete({

    group

}){

    if(
        !group ||
        !Array.isArray(
            group.words
        ) ||
        group.words.length === 0
    ){

        return false;

    }

    return group.words.every(
        word =>
            isWordLearned({

                category:
                    group.category,

                level:
                    word.level,

                id:
                    word.id

            })
    );

}


/*
    ========================================
    選択した級の
    全単語が学習済みか
========================================
*/

function areAllSelectedWordsLearned({

    category,
    levels,
    questions

}){

    const targetWords =
        questions.filter(
            question =>
                levels.includes(
                    question.level
                )
        );

    if(
        targetWords.length === 0
    ){

        return false;

    }

    return targetWords.every(
        question =>
            isWordLearned({

                category:
                    category,

                level:
                    question.level,

                id:
                    question.id

            })
    );

}


/*
    ========================================
    新しい学習グループを作成
========================================
*/

function createStudyGroup({

    category,
    levels,
    questions,
    questionCount

}){

    const count =
        normalizeQuestionCount(
            questionCount
        );


    /*
        現在選択されている級から
        まだ3回正解していない単語を取得
    */

    let available =
        questions.filter(
            question =>

                levels.includes(
                    question.level
                ) &&

                !isWordLearned({

                    category:
                        category,

                    level:
                        question.level,

                    id:
                        question.id

                })
        );


    /*
        全単語が学習済みなら
        新しい周回を開始
    */

    if(
        available.length === 0
    ){

        resetStudyCycle({

            category:
                category,

            levels:
                levels,

            questions:
                questions

        });


        available =
            questions.filter(
                question =>

                    levels.includes(
                        question.level
                    )
            );

    }


    /*
        ランダムに並べる
    */

    const shuffled =
        shuffleStudyArray(
            available
        );


    /*
        ★重要

        現在設定されている問題数だけ
        学習グループに入れる。

        例えば

        1問 → 1問
        2問 → 2問
        5問 → 5問

        とする。
    */

    const selected =
        shuffled.slice(
            0,
            Math.min(
                count,
                shuffled.length
            )
        );


    const group = {

        category:
            category,

        levels:
            [...levels],

        questionCount:
            count,

        words:
            selected.map(
                question => ({

                    id:
                        question.id,

                    level:
                        question.level

                })
            ),

        createdAt:
            Date.now()

    };


    saveStudyGroup(
        group
    );


    return group;

}


/*
    ========================================
    学習グループを準備
========================================
*/

function prepareStudyGroup({

    category,
    levels,
    questions,
    questionCount

}){

    const count =
        normalizeQuestionCount(
            questionCount
        );


    let group =
        getStudyGroup();


    /*
        ====================================
        ① グループがない
        ====================================
    */

    if(!group){

        return createStudyGroup({

            category:
                category,

            levels:
                levels,

            questions:
                questions,

            questionCount:
                count

        });

    }


    /*
        ====================================
        ② カテゴリー・級・問題数が
           変わっている
        ====================================
    */

    if(
        !isSameStudyGroupSetting({

            group:
                group,

            category:
                category,

            levels:
                levels,

            questionCount:
                count

        })
    ){

        /*
            ★ここが今回の重要部分

            例えば

            2問
            ↓
            10問

            に変更された場合、

            古いグループは削除する。

            ただし wordStudyProgress は
            一切削除しない。

            つまり今までの
            「○/3」はそのまま。
        */

        clearStudyGroup();


        return createStudyGroup({

            category:
                category,

            levels:
                levels,

            questions:
                questions,

            questionCount:
                count

        });

    }


    /*
        ====================================
        ③ 現在のグループが
           全員3回正解済み
        ====================================
    */

    if(
        isStudyGroupComplete({
            group
        })
    ){

        return createStudyGroup({

            category:
                category,

            levels:
                levels,

            questions:
                questions,

            questionCount:
                count

        });

    }


    /*
        ====================================
        ④ まだ同じグループを続ける
        ====================================
    */

    return group;

}


/*
    ========================================
    グループに含まれる単語を
    実際の問題データから取得
========================================
*/

function getStudyGroupWords({

    group,
    questions

}){

    if(
        !group ||
        !Array.isArray(
            group.words
        )
    ){

        return [];

    }


    return group.words
        .map(
            word => {

                return questions.find(
                    question =>

                        String(
                            question.id
                        ) ===
                        String(
                            word.id
                        ) &&

                        question.level ===
                        word.level
                );

            }
        )
        .filter(
            Boolean
        );

}


/*
    ========================================
    現在のグループから
    まだ3回正解していない単語だけ取得
========================================
*/

function getCurrentStudyGroupWords({

    category,
    levels,
    questions,
    questionCount

}){

    const group =
        prepareStudyGroup({

            category:
                category,

            levels:
                levels,

            questions:
                questions,

            questionCount:
                questionCount

        });


    const groupWords =
        getStudyGroupWords({

            group:
                group,

            questions:
                questions

        });


    return groupWords.filter(
        question =>
            !isWordLearned({

                category:
                    category,

                level:
                    question.level,

                id:
                    question.id

            })
    );

}


/*
    ========================================
    未学習単語取得
========================================
*/

function getUnlearnedWords({

    category,
    levels,
    questions

}){

    let questionCount =
        Number(
            localStorage.getItem(
                "questionCount"
            )
        );


    questionCount =
        normalizeQuestionCount(
            questionCount
        );


    /*
        ★全単語から取り直さない。

        必ず現在のグループから取得する。
    */

    return getCurrentStudyGroupWords({

        category:
            category,

        levels:
            levels,

        questions:
            questions,

        questionCount:
            questionCount

    });

}


/*
    ========================================
    周回完了判定
========================================
*/

function isStudyCycleComplete({

    category,
    levels,
    questions

}){

    return areAllSelectedWordsLearned({

        category:
            category,

        levels:
            levels,

        questions:
            questions

    });

}


/*
    ========================================
    周回をリセット
========================================
*/

function resetStudyCycle({

    category,
    levels,
    questions

}){

    const progress =
        getWordStudyProgress();


    questions.forEach(
        question => {

            if(
                !levels.includes(
                    question.level
                )
            ){

                return;

            }


            const key =
                getWordProgressKey(

                    category,

                    question.level,

                    question.id

                );


            delete progress[key];

        }
    );


    saveWordStudyProgress(
        progress
    );


    /*
        新しい周回なので
        現在のグループも削除
    */

    clearStudyGroup();

}


/*
    ========================================
    周回状態を確認
========================================
*/

function prepareStudyCycle({

    category,
    levels,
    questions

}){

    if(
        isStudyCycleComplete({

            category:
                category,

            levels:
                levels,

            questions:
                questions

        })
    ){

        resetStudyCycle({

            category:
                category,

            levels:
                levels,

            questions:
                questions

        });

        return true;

    }

    return false;

}


/*
    ========================================
    現在の学習グループを取得
========================================
*/

function getCurrentStudyGroup({

    category,
    levels,
    questions,
    questionCount

}){

    return prepareStudyGroup({

        category:
            category,

        levels:
            levels,

        questions:
            questions,

        questionCount:
            questionCount

    });

}


/*
    ========================================
    現在のグループの
    残り単語数
========================================
*/

function getStudyGroupRemainingCount({

    category,
    levels,
    questions,
    questionCount

}){

    const words =
        getCurrentStudyGroupWords({

            category:
                category,

            levels:
                levels,

            questions:
                questions,

            questionCount:
                questionCount

        });


    return words.length;

}