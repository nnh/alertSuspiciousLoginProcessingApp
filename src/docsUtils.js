function replaceDocumentText_(targetDoc, parameters) {
  const paragraphs = targetDoc.getBody().getParagraphs();
  paragraphs.forEach(paragraph => {
    const sourceText = paragraph.getText();
    let replaceText = null;
    parameters.forEach((value, key) => {
      if (new RegExp(key).test(sourceText)) {
        replaceText = sourceText.replace(key, value);
        return;
      }
    });
    if (replaceText !== null) {
      paragraph.setText(replaceText);
    }
  });
}
function copyDocumentAndGetContent_(parameters) {
  const sourceDocument = DriveApp.getFileById(
    PropertiesService.getScriptProperties().getProperty('mailTemplateDocsId')
  );
  const copiedFile = sourceDocument.makeCopy();
  const copiedDocument = DocumentApp.openById(copiedFile.getId());
  replaceDocumentText_(copiedDocument, parameters);
  copiedDocument.setName(
    `${Utilities.formatDate(
      new Date(),
      'GMT',
      'yyyyMMdd'
    )}_Alert: Suspicious loginに対する確認`
  );
  return copiedFile.getUrl();
}
