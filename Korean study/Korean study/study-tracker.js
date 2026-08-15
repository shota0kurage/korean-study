/*
    ========================================
    Korean Study
    学習記録・目標・連続学習 共通処理
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


    /*
        古い日付を
        必要以上に残さない
    */

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


    /*
        今日まだ学習していなければ
        昨日から数える
    */

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