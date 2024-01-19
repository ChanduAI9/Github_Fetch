$(document).ready(function () {
    let currentPage = 1;
    let repositoriesPerPage = 10;
    let currentRepositories = []; 

    function fetchRepositories(username) {
        const apiUrl = `https://api.github.com/users/${username}/repos`;

        //loading indicator
        showLoadingIndicator();

        $.get(apiUrl)
            .done(function (repos) {
                hideLoadingIndicator();
                currentRepositories = repos; 
                displayGitHubDetails(username);
                displayRepositories(repos);
            })
            .fail(function (error) {
                hideLoadingIndicator();
                $('#repositories').html('<p>Error fetching repositories.</p>');
                console.error('Error fetching repositories:', error);
            });
    }

    function showLoadingIndicator() {
        $('#loadingIndicator').show();
    }

    function hideLoadingIndicator() {
        $('#loadingIndicator').hide();
    }

    function displayGitHubDetails(username) {
        console.log("GitHub Details:", username);

        const githubDetailsContainer = $('#githubDetails');
        githubDetailsContainer.empty();

        const githubDetails = `
            <div class="text-center mb-4">
                <p><strong>Username:</strong> ${username}</p>
                <p><strong>GitHub Profile:</strong> <a href="https://github.com/${username}" target="_blank">https://github.com/${username}</a></p>
            </div>
        `;
        githubDetailsContainer.append(githubDetails);
    }

    function displayRepositories(repositories) {
        const repositoriesContainer = $('#repositories');
        repositoriesContainer.empty();

        const numReposPerTab = 6;
        const numReposPerRow = 2;

        const tabContentContainer = $('<div class="tab-content"></div>');

        for (let i = 0; i < repositories.length; i += numReposPerTab) {
            const tabIndex = i / numReposPerTab;
            const tabId = `tab-${tabIndex}`;

            const tabContent = $(`<div class="tab-pane fade" id="${tabId}" role="tabpanel" aria-labelledby="${tabId}-tab"></div>`);

            for (let j = i; j < i + numReposPerTab && j < repositories.length; j += numReposPerRow) {
                const rowElement = $('<div class="row mb-3"></div>');

                for (let k = j; k < j + numReposPerRow && k < repositories.length; k++) {
                    const repo = repositories[k];
                    const repoElement = `
                        <div class="col-md-6">
                            <div class="card mb-3">
                                <div class="card-body">
                                    <h5 class="card-title"><a href="${repo.html_url}" target="_blank">${repo.name}</a></h5>
                                    <p class="card-text">${repo.description || 'No description available'}</p>
                                    <p class="card-text"><strong>Language:</strong> ${repo.language || 'Not specified'}</p>
                                    <p class="card-text"><strong>Stars:</strong> ${repo.stargazers_count}</p>
                                    <p class="card-text"><strong>Last Update:</strong> ${new Date(repo.updated_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    `;
                    rowElement.append(repoElement);
                }

                tabContent.append(rowElement);
            }

            tabContentContainer.append(tabContent);
        }

        repositoriesContainer.append(tabContentContainer);

        const tabOptionsContainer = $('<ul class="nav nav-tabs justify-content-center" id="repoTabs" role="tablist"></ul>');

        for (let i = 0; i < repositories.length; i += numReposPerTab) {
            const tabIndex = i / numReposPerTab;
            const tabId = `tab-${tabIndex}`;

            const tabLink = $(`<li class="nav-item"><a class="nav-link" id="${tabId}-tab" data-toggle="tab" href="#${tabId}" role="tab" aria-controls="${tabId}" aria-selected="true">${tabIndex + 1}</a></li>`);

            tabOptionsContainer.append(tabLink);
        }

        repositoriesContainer.append(tabOptionsContainer);

        displayPagination(repositories.length);

        $('#repoTabs a:first').tab('show');

        const searchBarContainer = $('<div class="mt-3"></div>');
        const searchBar = $('<input type="text" class="form-control" id="searchBar" placeholder="Search repositories">');

        searchBar.keyup(function () {
            const searchQuery = $(this).val().toLowerCase();
            const filteredRepositories = currentRepositories.filter(repo =>
                repo.name.toLowerCase().includes(searchQuery) ||
                (repo.description && repo.description.toLowerCase().includes(searchQuery))
            );
            displayRepositories(filteredRepositories);
        });

        searchBarContainer.append(searchBar);
        repositoriesContainer.prepend(searchBarContainer);
    }

    function displayPagination(totalRepositories) {
        const totalPages = Math.ceil(totalRepositories / repositoriesPerPage);

        const paginationContainer = $('#pagination');
        paginationContainer.empty();

        for (let i = 1; i <= totalPages; i++) {
            const button = $(`<button class="btn btn-light">${i}</button>`);
            button.click(() => {
                currentPage = i;
                fetchRepositories(username);
            });

            paginationContainer.append(button);
        }
    }

    $('#githubForm').submit(function (event) {
        event.preventDefault();

        const username = $('#usernameInput').val();

        if (username.trim() !== '') {
            fetchRepositories(username);
        } else {
            console.error('Username cannot be empty.');
        }
    });
});
