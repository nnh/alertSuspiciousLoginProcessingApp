function getRecentEmail() {
  // 現在の日時を取得
  const currentDate = new Date();
  const oneDayAgo = new Date(currentDate);
  oneDayAgo.setDate(currentDate.getDate() - 1);
  // メールの検索条件を指定
  const subjectText = 'Alert: Suspicious login';
  const targetDate = Utilities.formatDate(oneDayAgo, 'GMT', 'yyyy/MM/dd');
  let query = '';
  query = query + `subject:${subjectText}`;
  query = query + ` after: ${targetDate}`;
  query =
    query +
    ` to:${PropertiesService.getScriptProperties().getProperty(
      'toMailAddress'
    )}`;

  // メールを検索
  const threads = GmailApp.search(query);

  if (threads.length === 0) {
    return;
  }
  threads.forEach(thread => {
    thread.getMessages().forEach(email => {
      const emailBody = email.getPlainBody();
      const [ip, activityDate, user] = [
        'Attempted Login IP: ',
        'Activity Date: ',
        'User: ',
      ].map(headText => extractTextFromEmailBody_(emailBody, headText));
      const japanDate = convertToJapanStandardTime_(activityDate);
      const userDeptAndName =
        user !== null ? extractDepartmentAndNameFromEmail_(user) : '';
      // ドキュメントの作成
      const parameters = new Map([
        ['```dateAndTime```', japanDate],
        ['```emailAddress```', user],
        ['```deptAndName```', userDeptAndName],
      ]);
      const documentUrl = copyDocumentAndGetContent_(parameters);
      const postText = `${subjectText}\n${documentUrl}\nIP:${ip}`;
      // chatにドキュメントを送信
      sendWorkInformationToChat_(postText);
    });
  });
}
function convertToJapanStandardTime_(dateString) {
  // Dateオブジェクトを作成し、タイムゾーンを日本標準時に設定
  const dateObj = new Date(dateString);
  dateObj.setTime(dateObj.getTime() + 9 * 60 * 60 * 1000); // 9時間分のミリ秒を追加

  // 日付を文字列にフォーマット
  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short',
  };
  const japanDate = dateObj.toLocaleDateString('ja-JP', options);

  return japanDate;
}
function extractTextFromEmailBody_(emailBody, headText) {
  const head = headText;
  const headRegExp = new RegExp(`${head}.*`);
  const text = headRegExp.test(emailBody)
    ? headRegExp.exec(emailBody)[0].replace(head, '')
    : null;
  return text;
}
function extractDepartmentAndNameFromEmail_(emailAddress) {
  const columnIndex = new Map([
    ['emailAddress', 8],
    ['name', 1],
    ['department', 9],
  ]);
  try {
    const spreadSheet = SpreadsheetApp.openById(
      PropertiesService.getScriptProperties().getProperty('userListId')
    );
    const sheet = spreadSheet.getSheetByName(
      PropertiesService.getScriptProperties().getProperty('userListSheetName')
    );
    const values = sheet.getDataRange().getValues();
    const targetValues = values.filter(
      value => value[columnIndex.get('emailAddress')] === emailAddress
    );
    const [department, name] =
      targetValues.length === 1
        ? [
            targetValues[0][columnIndex.get('department')],
            targetValues[0][columnIndex.get('name')],
          ]
        : [null, null];
    return `${department} ${name} 様`;
  } catch (error) {
    return null;
  }
}
