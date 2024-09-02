# Car Management App

## Overview

The Car Management App is a web application that allows users to manage a list of cars. Users can view, filter, sort, and add new cars to the list. The application supports data exporting to CSV and includes modals for filtering, sorting, and adding new cars.

## Features

- **View Cars**: Display a list of cars with details such as name, mpg, cylinders, displacement, horsepower, weight, acceleration, model year, and origin.
- **Filter Cars**: Apply filters based on car attributes such as name, origin, mpg, and other numerical values.
- **Sort Cars**: Sort the car list based on different attributes in ascending or descending order.
- **Add New Car**: Add new car entries through a modal form.
- **Export to CSV**: Export the filtered car data to a CSV file.

## Technologies Used

- **Angular**: Framework for building the front-end of the application.
- **Angular Material**: For UI components and dialogs.
- **RxJS**: For reactive programming with asynchronous data streams.
- **NodeJs(express) Server**: For simulating API for data storage and retrieval.

## Getting Started

### Prerequisites

- Node.js and npm should be installed on your system. You can download and install them from [nodejs.org](https://nodejs.org/).

### Installation

1. **Clone the Repository**

   ```bash
   git clone https://github.com/Bikal-Adhikari/fireHawks-Cars-frontend.git
   cd fireHawks-Cars-frontend
   ```

2. **Install Dependencies**

   ```bash
   npm install
   ```

3. **Start the Application**

   ```bash
   npm start
   ```

This will start the application on `http://localhost:4200`.

### Configuration

- The application uses API for data storage and retrieval. The API is implemented using NodeJs and Express Js.

### Usage

#### Viewing Cars

i. Navigate to the main page to view the list of cars.
ii. Use the search bar to filter cars by name.

#### Filtering Cars

i. Open the filter modal by clicking on the filter button.
ii. Select the filter criteria and apply the filters.
iii. To reset filters, click on the "Reset Filters" button.

#### Sorting Cars

i. Open the sort modal by clicking on the sort button.
ii. Choose the attribute to sort by and the sort order (ascending or descending).
iii. Apply the sorting to update the car list.

#### Adding a New Car

i. Open the add car modal by clicking on the add car button.
ii. Fill out the form with the car details.
iii. Submit the form to add the new car to the list.

#### Exporting Data

i. Click on the "Export to CSV" button to download the filtered car data as a CSV file.

### Contributing

#### Fork the Repository

Click on the "Fork" button at the top right of this page to create a copy of the repository in your GitHub account.

#### Clone Your Fork

```bash
   git clone https://github.com/Bikal-Adhikari/fireHawks-Cars-frontend.git
   cd fireHawks-Cars-frontend
```

#### Create a Feature Branch

```bash
git checkout -b my-feature-branch
```

#### Commit Your Changes

```bash
git add .
git commit -m "Add some feature"
```

#### Push to Your Fork

```bash
git push origin my-feature-branch
```

#### Create a Pull Request

Go to the original repository and create a pull request from your feature branch.

### License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
