import React from 'react';
import { connect } from 'react-redux';

import { get, actions } from '../../../store';
import { assert, translate as $t } from '../../../helpers';

import CustomBankField from './custom-bank-field';

class NewBankForm extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            selectedBankIndex: 0,
            expanded: this.props.expanded
        };

        this.handleChangeBank = this.handleChangeBank.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleToggleExpand = this.handleToggleExpand.bind(this);
        this.handleReset = this.handleReset.bind(this);

        this.bankSelector = null;
        this.loginInput = null;
        this.passwordInput = null;
        this.customFieldsInputs = new Map();
    }

    selectedBank() {
        return this.props.banks[this.state.selectedBankIndex];
    }

    handleReset(event) {
        this.setState({
            selectedBankIndex: 0
        });
        event.target.reset();
    }

    handleToggleExpand() {
        this.setState({
            selectedBankIndex: 0,
            expanded: !this.state.expanded
        });
    }

    handleChangeBank(event) {
        let uuid = event.target.value;
        let selectedBankIndex = this.props.banks.findIndex(bank => bank.uuid === uuid);

        if (selectedBankIndex !== -1) {
            this.setState({ selectedBankIndex });
        } else {
            assert(false, "unreachable: the bank didn't exist?");
        }
    }

    handleSubmit(event) {
        event.preventDefault();

        let uuid = this.bankSelector.value;
        let login = this.loginInput.value.trim();
        let password = this.passwordInput.value.trim();

        let selectedBank = this.selectedBank();

        let { customFields } = selectedBank;
        if (customFields.length) {
            customFields = customFields.map((field, index) =>
                this.customFieldsInputs.get(`${index}${selectedBank.uuid}`).getValue()
            );
        }

        if (!login.length || !password.length) {
            alert($t('client.settings.missing_login_or_password'));
            return;
        }

        this.props.createAccess(uuid, login, password, customFields);
    }

    renderHeader(body) {
        let expanded = this.state.expanded;

        return (
            <div className="top-panel panel panel-default">
                <div
                  className="panel-heading clickable"
                  onClick={ this.handleToggleExpand }>
                    <h3 className="title panel-title">
                        { $t('client.settings.new_bank_form_title') }
                    </h3>

                    <div className="panel-options">
                        <span
                          className={ `option-legend fa fa-${expanded ?
                          'minus' : 'plus'}-circle` }
                          aria-label="add"
                          title={ $t('client.settings.add_bank_button') }
                        />
                    </div>
                </div>
                { body }
            </div>
        );
    }

    render() {
        let expanded = this.state.expanded;
        if (!expanded) {
            return this.renderHeader(<div className="transition-expand" />);
        }

        let options = this.props.banks.map(bank =>
            <option
              key={ bank.id }
              value={ bank.uuid }>
                { bank.name }
            </option>
        );

        let selectedBank = this.selectedBank();

        this.customFieldsInputs.clear();
        let maybeCustomFields = null;
        if (selectedBank.customFields.length > 0) {
            maybeCustomFields = selectedBank.customFields.map((field, index) => {
                let key = `${index}${selectedBank.uuid}`;
                let customFieldCb = input => {
                    this.customFieldsInputs.set(key, input);
                };

                return (
                    <CustomBankField
                      ref={ customFieldCb }
                      params={ field }
                      key={ key }
                    />
                );
            });
        }

        let bankSelectorCb = element => {
            this.bankSelector = element;
        };
        let loginInputCb = element => {
            this.loginInput = element;
        };
        let passwordInputCb = element => {
            this.passwordInput = element;
        };
        let form = (
            <div className="panel-body transition-expand">
                <form
                  onReset={ this.handleReset }
                  onSubmit={ this.handleSubmit }>
                    <div className="form-group">
                        <label htmlFor="bank">
                            { $t('client.settings.bank') }
                        </label>
                        <select
                          className="form-control"
                          id="bank"
                          ref={ bankSelectorCb }
                          onChange={ this.handleChangeBank }
                          defaultValue={ selectedBank.uuid }>
                            { options }
                        </select>
                    </div>

                    <div className="form-group">
                        <div className="row">
                            <div className="col-sm-6">
                                <label htmlFor="id">
                                    { $t('client.settings.login') }
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  id="id"
                                  ref={ loginInputCb }
                                />
                            </div>

                            <div className="col-sm-6">
                                <label htmlFor="password">
                                    { $t('client.settings.password') }
                                </label>
                                <input
                                  type="password"
                                  className="form-control"
                                  id="password"
                                  ref={ passwordInputCb }
                                />
                            </div>
                        </div>
                    </div>

                    { maybeCustomFields }

                    <div className="btn-toolbar pull-right">
                        <input
                          type="reset"
                          className="btn btn-default"
                          value={ $t('client.settings.reset') }
                        />

                        <input
                          type="submit"
                          className="btn btn-primary"
                          value={ $t('client.settings.submit') }
                        />
                    </div>
                </form>
            </div>
        );

        return this.renderHeader(form);
    }
}

NewBankForm.propTypes = {
    // Whether the form is expanded or not.
    expanded: React.PropTypes.bool.isRequired,

    // An array of banks.
    banks: React.PropTypes.array.isRequired,

    // A function to create the access with the credentials.
    createAccess: React.PropTypes.func.isRequired
};

const Export = connect(state => {
    return {
        banks: get.banks(state)
    };
}, dispatch => {
    return {
        createAccess: (uuid, login, password, fields) => {
            actions.createAccess(dispatch, uuid, login, password, fields);
        }
    };
})(NewBankForm);

export default Export;
