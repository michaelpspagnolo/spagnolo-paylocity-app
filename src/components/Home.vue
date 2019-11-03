<template>
  <v-container>
    <v-layout wrap>
      <v-flex xs12 mb-5>
        <h1>Paylocity Benefit Challenge</h1>
        <v-row>
          <v-card width="500" class="ma-2 px-2">
            <v-card-title>Input Employee Information</v-card-title>
            <v-card-text>
              <!-- Employee input form -->
              <v-form class="px-2" ref="userform" v-if="!hasDependants">
                <v-row justify-start>
                  <v-text-field
                    label="First Name"
                    v-model="firstName"
                    class="px-1"
                    :rules="[inputRules.alpha]"
                  ></v-text-field>
                  <v-text-field
                    label="Last Name"
                    v-model="lastName"
                    class="px-1"
                    :rules="[inputRules.alpha]"
                  ></v-text-field>
                </v-row>
                <v-row justify-start>
                  <v-currency-field
                    label="Pay/Period"
                    v-bind="currency_config"
                    v-model="pay"
                    class="px-1"
                  ></v-currency-field>
                  <v-text-field
                    label="Pay Periods/Year"
                    v-model="payPeriods"
                    class="px-1"
                    :rules="[inputRules.num]"
                    type="number"
                  ></v-text-field>
                </v-row>
                <v-btn
                  class="mx-2"
                  color="primary"
                  @click="loadDependant"
                  hint="Add Dependant"
                >Add Dependants</v-btn>
                <v-btn class="success ma-2" @click="submit">Submit</v-btn>
              </v-form>
              <!-- Dependant input form -->
              <v-form class="px-2" ref="dependform" v-if="hasDependants">
                <v-row>
                  <v-text-field
                    label="Dependant First Name"
                    v-model="dependant.first"
                    class="px-1"
                    :rules="[inputRules.alpha]"
                  ></v-text-field>
                  <v-text-field
                    label="Dependant Last Name"
                    v-model="dependant.last"
                    class="px-1"
                    :rules="[inputRules.alpha]"
                  ></v-text-field>
                  <v-select
                    label="Relation"
                    :items="relations"
                    v-model="dependant.relation"
                    class="px-1"
                    :rules="[inputRules.alpha]"
                  ></v-select>
                </v-row>
                <v-btn class="mx-2" color="primary" @click="addDependant">Add Another</v-btn>
                <v-btn class="success ma-2" @click="addLast">Done Adding Dependants</v-btn>
              </v-form>
            </v-card-text>
          </v-card>
          <!-- Preview Card -->
          <v-card min-width="500" class="ma-2 px-2">
            <v-card-title>Preview</v-card-title>
            <h5>Employee</h5>
            <v-simple-table :dense="true">
              <thead>
                <tr>
                  <th class="text-left">Last Name</th>
                  <th class="text-left">First Name</th>
                  <th class="text-left">Deduction/Pay Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td class="text-left">{{ lastName }}</td>
                  <td class="text-left">{{ firstName }}</td>
                  <td class="text-left">{{ getEmployeeCost() }}</td>
                </tr>
              </tbody>
            </v-simple-table>
            <h5 v-if="dependants.length">Dependants</h5>
            <v-simple-table :dense="true" v-if="dependants.length">
              <thead>
                <tr>
                  <th class="text-left">Last Name</th>
                  <th class="text-left">First Name</th>
                  <th class="text-left">Relationship</th>
                  <th class="text-left">Deduction/Pay Period</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="d in dependants" :key="d.index">
                  <td class="text-left">{{ d.last }}</td>
                  <td class="text-left">{{ d.first }}</td>
                  <td class="text-left">{{ d.relation }}</td>
                  <td class="text-left">{{ d.deduction }}</td>
                </tr>
              </tbody>
            </v-simple-table>
            <br />
            <v-row style="position:absolute; bottom:0; margin:2px">
              <h4>Total Deductions/Pay Period: ${{ getCurrentDeductions() }}</h4>
            </v-row>
          </v-card>
        </v-row>
        <!-- <p>{{users}}</p> -->
        <!-- Employees Table -->
        <v-card max-width="1008">
          <v-data-table
            :headers="headers"
            :items="users"
            :single-expand="true"
            :expanded.sync="expanded"
            :search="search"
            item-key="id"
            show-expand
          >
            <template v-slot:top>
              <v-toolbar flat color="white">
                <v-toolbar-title>Employees</v-toolbar-title>
                <v-spacer></v-spacer>
                <v-icon>mdi-table-search</v-icon>
                <v-text-field v-model="search" label="Search" single-line hide-details></v-text-field>
              </v-toolbar>
            </template>
            <template v-slot:expanded-item="{ item }">
              <td :colspan="headers.length" class="px-0">
                <v-simple-table :dense="true">
                  <template v-slot:default>
                    <thead>
                      <tr>
                        <th>Dependants</th>
                        <th class="text-left">Last Name</th>
                        <th class="text-left">First Name</th>
                        <th class="text-left">Relationship</th>
                        <th class="text-left">Deduction/Pay Period</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="d in item.dependants" :key="d.index">
                        <td></td>
                        <td class="text-left">{{ d.last }}</td>
                        <td class="text-left">{{ d.first }}</td>
                        <td class="text-left">{{ d.relation }}</td>
                        <td class="text-left">{{ d.deduction }}</td>
                      </tr>
                    </tbody>
                  </template>
                </v-simple-table>
              </td>
            </template>
          </v-data-table>
        </v-card>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    //benefit costs
    cost: 1000,
    dCost: 500,
    //Default Pay
    pay: 2000,
    payPeriods: 26,
    //Users Info
    id: 0,
    firstName: "",
    lastName: "",
    deduction: 0,
    totalDeduction: 0,
    dependant: { first: "", last: "", relation: "", deduction: 0 },
    dependants: [],
    users: [],
    //Form Info
    hasDependants: false,
    relations: ["child", "parent", "spouse", "other"],
    //Table Info
    search: "",
    expanded: [],
    headers: [
      { text: "Last Name", value: "lastName" },
      { text: "First Name", value: "firstName" },
      { text: "Pay", value: "pay" },
      { text: "Pay Periods", value: "payPeriods" },
      { text: "Employee Deduction", value: "deduction" },
      { text: "# Dependants", value: "dependants.length" },
      { text: "Total Deductions", value: "totalDeduction" }
    ],
    //input checks
    inputRules: {
      alpha: v => !!v.length || "Field is required",
      num: v => v > 0 || "must be greater than 0"
    },
    //currency field
    currency_config: {
      decimal: ".",
      thousands: ",",
      prefix: "$",
      suffix: "",
      precision: 2,
      masked: false,
      allowBlank: false,
      min: 0,
      max: Number.MAX_SAFE_INTEGER
    }
  }),
  methods: {
    // submit and reset info for next entry
    submit() {
      if (this.dependant.first.length === 0) {
        this.hasDependants = false;
      }
      if (this.$refs.userform.validate()) {
        this.putEmployeeDeduction();
        let deduct = this.deduction;
        let totalDeduct = this.getCurrentDeductions();
        let userinfo = {
          id: this.users.length,
          firstName: this.firstName,
          lastName: this.lastName,
          pay: this.pay,
          payPeriods: this.payPeriods,
          deduction: deduct,
          totalDeduction: totalDeduct,
          dependants: this.dependants
        };
        this.users.push(userinfo);
        this.$refs.userform.resetValidation();
        this.lastName = "";
        this.firstName = "";
        this.pay = 2000;
        this.payPeriods = 26;
        this.dependant = { first: "", last: "", relation: "", deduction: 0 };
        this.dependants = [];
        this.hasDependants = false;
      }
    },
    // Load Dependant form
    loadDependant() {
      this.hasDependants = true;
      this.$refs.userform.resetValidation();
      this.$refs.dependform.resetValidation();
    },
    // add dependant to this users dependant array
    addDependant() {
      if (this.$refs.dependform.validate()) {
        this.putDependantDeduction();
        this.dependants.push(this.dependant);
        this.dependant = { first: "", last: "", relation: "", deduction: 0 };
        this.$refs.dependform.resetValidation();
      }
    },
    // Add Dependant and return to employee form (Just returns if form is empty)
    addLast() {
      if (
        this.dependant.first !== "" ||
        this.dependant.last !== "" ||
        this.dependant.relation !== ""
      ) {
        if (this.$refs.dependform.validate()) {
          this.addDependant();
          this.hasDependants = false;
        }
      } else {
        this.hasDependants = false;
      }
    },
    // Tally employees cost per paycheck (includes 'A' discount)
    getEmployeeCost() {
      if (this.firstName === "" || this.lastName === "") {
        return 0;
      }

      let n =
        this.firstName.toLowerCase().startsWith("a") ||
        this.lastName.toLowerCase().startsWith("a");

      let deduct1 = this.cost / this.payPeriods;
      if (n) {
        deduct1 = (this.cost * 0.9) / this.payPeriods;
      }

      return deduct1.toFixed(2);
    },
    // Put employees deduction into employee object
    putEmployeeDeduction() {
      this.deduction = this.getEmployeeCost();
    },
    // Put deduction into current dependant object ((includes 'A' discount))
    putDependantDeduction() {
      let dFirst = this.dependant.first;
      let dLast = this.dependant.last;

      let n =
        dFirst.toLowerCase().startsWith("a") ||
        dLast.toLowerCase().startsWith("a");

      let deduct = this.dCost / this.payPeriods;
      if (n) {
        deduct = (this.dCost * 0.9) / this.payPeriods;
      }
      this.dependant.deduction = deduct.toFixed(2);
    },
    // Tally full (employee and dependants) deduction
    getCurrentDeductions() {
      let deduct2 = Number(this.getEmployeeCost());
      let i;
      for (i = 0; i < this.dependants.length; i++) {
        deduct2 += Number(this.dependants[i].deduction);
      }

      return deduct2.toFixed(2);
    }
  }
};
</script>
