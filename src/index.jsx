import ForgeUI, { render, Fragment, Text, Button, ButtonSet, useState, useProductContext } from "@forge/ui";
import api from "@forge/api";

const { LANG_API_KEY, DEBUG_LOGGING } = process.env;

const OPTIONS = [
  ['Language Identification', 'lang'],
];
var lan = '';

const Panel = () => {
  const { platformContext: { issueKey } } = useProductContext();
  const [lang, setLang] = useState(null);

  async function setLanguage(countryCode) {
    const issueResponse = await api.asApp().requestJira(`/rest/api/2/issue/${issueKey}?fields=summary,description`);
    await checkResponse('Jira API', issueResponse);
    const { summary, description } = (await issueResponse.json()).fields;
    const response = await api.fetch(`https://api.meaningcloud.com/lang-2.0?key=961f84ad022230871e07261de9f70a28&txt=${description}`);
    const languages = (await response.json()).language_list;
    for (var key in languages) {
      if (languages.hasOwnProperty(key)) {
        console.log(key)
        if (key!=0){
          lan = lan + ' , '
        }
        lan = lan + languages[key]['name'];
      }
    }
    //lan = JSON.stringify(lan)

    setLang({
      language: lan
    });
  }
  
  // Render the UI
  return (
    <Fragment>
      <ButtonSet>
        {OPTIONS.map(([label, code]) =>
          <Button
            text={label}
            onClick={async () => { await setLanguage(code); }}
          />
        )}
      </ButtonSet>
      {lang && (
        <Fragment>
          <Text content={`**Language Used**: `+lang.language } />
        </Fragment>
      )}
    </Fragment>
  );
};

async function checkResponse(apiName, response) {
  if (!response.ok) {
    const message = `Error from ${apiName}: ${response.status} ${await response.text()}`;
    console.error(message);
    throw new Error(message);
  } else if (DEBUG_LOGGING) {
    console.debug(`Response from ${apiName}: ${await response.text()}`);
  }
}

export const run = render(<Panel />);
