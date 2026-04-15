import * as React from 'react';
import { ISpfxGithubSigninProps } from "../components/ISpfxGithubSigninProps";

import { spfi, SPFx } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/fields";


export default function SpfxGithubSignin(props: ISpfxGithubSigninProps): JSX.Element {
const thStyle: React.CSSProperties = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "2px solid #ccc"
};

const tdStyle: React.CSSProperties = {
  padding: "10px",
};
  const sp = spfi().using(SPFx(props.context));

  const [showFetchButton, setShowFetchButton] = React.useState(false);
  const [userData, setUserData] = React.useState<any[]>([]);


  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenFromURL = params.get("token");

    if (tokenFromURL) {
      localStorage.setItem("jwt-token", tokenFromURL);
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    const jwtToken = localStorage.getItem("jwt-token");

    if (jwtToken) {
            void getListData();
      setShowFetchButton(true);
    }
  }, []);

  //  Login
  const handleLogin = (): void => {
    const clientId = "Iv23li071LDPi8XBY0ag";

    const redirectUri = encodeURIComponent(
      "http://localhost:5000/auth/github/callback"
    );

    const scope = "repo";

    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;

    window.location.href = url;
  };

  //  Fetch GitHub Data
  function fetchData(): void {
    const jwt = localStorage.getItem("jwt-token");

    if (jwt) {
      const accessToken = jwt;

      fetch("https://api.github.com/user/repos", {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
        .then(res => res.json())
        .then(data => {
          console.log("github data ", data);
          void saveToSharePoint(data);
        })
        .catch(err => console.log(err));
    }
  }

  //  Save to SharePoint
  async function saveToSharePoint(repos: any[]): Promise<void> {
    try {

      for (const repo of repos) {
        await sp.web.lists
          .getByTitle("GithubData")
          .items.add({
            RepositoryName: repo.name,
            RepositoryURL: {
              Url: repo.html_url,
              Description: repo.name
            },
            IsPrivateRepository:  Boolean(repo.private)
          });
      }

      console.log("Saved to SharePoint");

      void getListData();

    } catch (error) {
      console.error("Error saving:", error);
    }
  }

  //  Fetch SharePoint List
  async function getListData(): Promise<void> {
    try {
      const repoData = await sp.web.lists
        .getByTitle("GithubData")
        .items
        .select("Id", "RepositoryName", "RepositoryURL", "IsPrivateRepository")();

      setUserData(repoData);

      /// pritng hte data , 
      const fields = await sp.web.lists.getByTitle("GithubData").fields();
      console.log("feilds details ar e" ,fields);
    

      console.log("List Data:", repoData);

    } catch (error) {
      console.error("Error fetching list:", error);
    }
  }

  return (
    <>
      {/* Login */}
      {!showFetchButton && (
        <button onClick={handleLogin}>
          Login with GitHub
        </button>
      )}

      {/* Fetch */}
      {showFetchButton && (
        <button onClick={fetchData}>
          Fetch & Save GitHub Repos
        </button>

      )}

      {userData.length > 0 && (
  <table style={{
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "20px"
  }}>
    <thead>
      <tr style={{ backgroundColor: "#f3f2f1" }}>
        <th style={thStyle}>Repository Name</th>
        <th style={thStyle}>Repository Link</th>
        <th style={thStyle}>Private</th>
      </tr>
    </thead>

    <tbody>
      {userData.map((item: any) => (
        <tr key={item.Id} style={{ borderBottom: "1px solid #ddd" }}>
          
          {/* Repo Name */}
          <td style={tdStyle}>
            {item.RepositoryName}
          </td>

          {/* Link */}
          <td style={tdStyle}>
            <a
              href={item.RepositoryURL?.Url}
    
              style={{ color: "#0078d4", textDecoration: "none" }}
            >
              Open Repo
            </a>
          </td>

          {/* Yes/No */}
          <td style={tdStyle}>
            {item.IsPrivateRepository ? "Yes" : "No"}
          </td>

        </tr>
      ))}
    </tbody>
  </table>
)}

    </>
  );
}
