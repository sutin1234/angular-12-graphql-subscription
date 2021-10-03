import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo, gql, QueryRef } from 'apollo-angular';
import { Observable } from 'rxjs';


const PROFILE_POST = gql`
  mutation ProfileMutation($firstName: String!, $lastName: String!, $position: String!) {
  insert_profiles(objects: {firstName: $firstName, lastName: $lastName, position: $position}) {
    affected_rows
  }
}
`;

const PROFILE_QUERY = gql`
   query ProfilesQuery {
      profiles {
        firstName
        id
        lastName
        position
      }
    }
`;
const PROFILE_DELETE = gql`
  mutation DeleteMutation($id: Int!) {
    delete_profiles_by_pk(id: $id) {
      id
    }
  }
`;
const PROFILE_SUBSCRIBTION = gql`
  subscription SubscribeProfile {
  profiles {
    firstName
    id
    lastName
    position
  }
}
`;


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Angular 12 Apollo graphQL';
  profiles: any[] = [];
  loading = true;
  error: any;
  myForm: FormGroup;
  id: number = 0;
  profilesQuery!: QueryRef<any>;
  profilesAsync!: Observable<any>;


  constructor(private apollo: Apollo, private fb: FormBuilder) {
    this.myForm = this.fb.group({
      firstName: [null, [Validators.required]],
      lastName: [null, [Validators.required]],
      position: [null, [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.profilesQuery = this.apollo
      .watchQuery({
        query: PROFILE_QUERY
      });
    this.profilesAsync = this.profilesQuery.valueChanges;
    this.profilesAsync.subscribe((result: any) => {
      this.profiles = result?.data?.profiles;
      this.loading = result.loading;
      this.error = result.error;
    });

    this.onSubscriptionToMoreProfile();

  }

  onSubscriptionToMoreProfile() {
    this.profilesQuery.subscribeToMore({
      document: PROFILE_SUBSCRIBTION,
      updateQuery: (prev, { subscriptionData }) => {
        console.log('updateQuery ', prev, { subscriptionData });
        if (!subscriptionData.data) {
          return prev;
        }
        const newProfile = subscriptionData.data.profiles;
        return {
          profiles: [...newProfile, ...prev.profiles]
        };
      }
    });
  }

  formSubmit() {
    if (this.myForm.valid) {
      this.apollo.mutate({
        mutation: PROFILE_POST,
        variables: this.myForm.value
      }).subscribe(({ data }) => {
        console.log('got data', data);
      }, (error) => {
        console.log('there was an error sending the query', error);
      });
    }
  }
  onDelete(id: number) {
    if (id) {
      this.apollo.mutate({
        mutation: PROFILE_DELETE,
        variables: { id }
      }).subscribe(({ data }) => {
        console.log('got data', data);
      }, (error) => {
        console.log('there was an error sending the query', error);
      });
    }
  }
}
