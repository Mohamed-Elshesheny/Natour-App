class APIfeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const query0bj = { ...this.queryString };
    // the ellipsis (...) in JavaScript serves as a versatile tool for spreading, gathering, copying, and concatenating data
    // and the {} is for creating a new object with it
    const excludedfields = ['page', 'sort', 'limit', 'fields'];
    excludedfields.forEach((el) => delete query0bj[el]); // foreach is a loop but it loops only with out creating a new object with it

    // 1B) advanced filtering
    let queryStr = JSON.stringify(query0bj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`); // regular expreisson (g) is for multiple time use
    console.log(JSON.parse(queryStr));
    this.query = this.query.find(JSON.parse(queryStr)); // query is requesting data from data base

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      // req.query بمعني انو طلب.انو يطلب بيانات من قواعد البيانات
      const sortBy = this.queryString.sort.split(',').join(' '); // the split will تفصل كل حاجه ما بينهم ، وي join هتجمع ما بينهم تاني
      console.log(sortBy);
      this.query = this.query.sort(sortBy); //line 20 // here in req.sort.sort the sort will be the property [price]
    } else {
      this.query = this.query.sort('-createdAt'); // default sorting
    }
    return this; // we write return this cause we need the objects to be returned
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields); // line 20
    } else {
      this.query = this.query.select('-__v'); // default limiting
    }
    return this;
  }

  pagination() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100; // Setting a default limit of 10
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}

module.exports = APIfeatures;
